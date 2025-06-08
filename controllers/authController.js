const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

exports.signUp = catchAsync(async (req, res, next) => {
    // We only get the information required and prevent users from creating admin profiles.
    // Admins can only be created via MongoDB using the compass app
    const newUser = await User.create({
        userName: req.body.userName,
        userEmail: req.body.userEmail,
        userPassword: req.body.userPassword,
        userConfirmPassword: req.body.userConfirmPassword,
    });

    const token = signToken(newUser);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
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

    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
});
