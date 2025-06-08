const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'You must specify a user name'],
        unique: true,
        trim: true,
    },
    userEmail: {
        type: String,
        required: [true, 'You must specify a user email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    userProfilePic: String,
    userPassword: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 12,
        select: false,
    },
    userConfirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.userPassword; // This only works on save
            },
            message: 'Passwords do not match',
        },
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('userPassword')) return next();

    this.userPassword = await bcrypt.hash(this.userPassword, 12);
    this.userConfirmPassword = undefined;
    next();
});

userSchema.methods.comparePassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
