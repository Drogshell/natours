const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObject = (obj, ...allowedFields) => {
    const filteredObject = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) filteredObject[el] = obj[el];
    });

    return filteredObject;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        data: {
            users,
        },
    });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
    if (req.body.userPassword || req.body.userConfirmPassword) {
        return next(
            new AppError('This is not the route to change passwords'),
            400
        );
    }

    const filteredBody = filterObject(req.body, 'name', 'email');

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

exports.deleteMyProfile = catchAsync(async (req, res, next) => {
    // This doesn't actually delete the user from the database, but from the users perspective it does.
    // Could potentially add some code that deletes them properly after some time has passed
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(203).json({
        status: 'success',
        data: null,
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "This route hasn't been defined",
    });
};
exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "This route hasn't been defined",
    });
};
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "This route hasn't been defined",
    });
};
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "This route hasn't been defined",
    });
};
