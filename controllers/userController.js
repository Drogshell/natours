const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObject = (obj, ...allowedFields) => {
    const filteredObject = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) filteredObject[el] = obj[el];
    });

    return filteredObject;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.userPassword || req.body.userConfirmPassword) {
        return next(
            new AppError('This is not the route to change passwords'),
            400
        );
    }

    const filteredBody = filterObject(req.body, 'userName', 'userEmail');

    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: {
            user: updateUser,
        },
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    // This doesn't actually delete the user from the database, but from the users perspective it does.
    // Could potentially add some code that deletes them properly after some time has passed
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined, please use /signup instead',
    });
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
