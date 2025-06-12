const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    user.userPassword = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signUp = catchAsync(async (req, res, next) => {
    // We only get the information required and prevent users from creating admin profiles.
    // Admins can only be created via MongoDB using the compass app
    const newUser = await User.create({
        userName: req.body.userName,
        userEmail: req.body.userEmail,
        userPassword: req.body.userPassword,
        userConfirmPassword: req.body.userConfirmPassword,
    });
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { userEmail, userPassword } = req.body;

    if (!userEmail || !userPassword) {
        return next(new AppError('No username or password', 400));
    }

    const user = await User.findOne({ userEmail }).select('+userPassword');

    if (
        !user ||
        !(await user.comparePassword(userPassword, user.userPassword))
    ) {
        return next(new AppError('Wrong username or password', 401));
    }
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // Get the token, see if it's actually there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in!', 401));
    }

    // Verify if it's a valid token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if the user still exists
    const currentUser = await User.findById(decoded.id);

    // If the user was deleted then throw an error
    if (!currentUser) {
        return next(
            new AppError(
                'The user that belongs to this token no longer exists',
                401
            )
        );
    }

    // If the user changed their password then throw an error
    if (currentUser.passwordChangedAfterTokenIssued(decoded.iat)) {
        return next(
            new AppError('Password recently changed!\nPlease login again', 401)
        );
    }

    // Finally grant access if nothing fails
    req.user = currentUser;
    next();
});

exports.restrictTo =
    (...roles) =>
    (req, res, next) => {
        // Roles is an array containing the allowed roles,
        // if the user doesn't have one of these roles, they can't go forward
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403
                )
            );
        }
    };

exports.updatePassword = catchAsync(async (req, res, next) => {
    // user.findByIdAndUpdate will NOT work here because mongoose doesn't keep track of the current object in memory
    const user = await User.findById(req.user.id).select('+userPassword');

    if (
        !(await user.comparePassword(
            req.body.passwordCurrent,
            user.userPassword
        ))
    ) {
        return next(new AppError('Incorrect password', 401));
    }

    user.userPassword = req.body.userPassword;
    user.userConfirmPassword = req.body.userConfirmPassword;
    await user.save();

    createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ userEmail: req.body.userEmail });

    if (!user) {
        return next(
            new AppError('There was no user linked to that email address', 404)
        );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot password? Submit a new one along with confirm password to ${resetURL}`;

    try {
        await sendEmail({
            email: user.userEmail,
            subject: 'Password reset (valid for 10 minutes)',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
        });
    } catch (e) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('Something went wrong sending that email', 500)
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.userPassword = req.body.userPassword;
    user.userConfirmPassword = req.body.userConfirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createSendToken(user, 200, res);
});
