const mongoose = require('mongoose');
const crypto = require('crypto');
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
    role: {
        type: String,
        enum: ['user', 'tour-guide', 'lead-tour-guide', 'admin'],
        default: 'user',
    },
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('userPassword')) return next();

    this.userPassword = await bcrypt.hash(this.userPassword, 12);
    this.userConfirmPassword = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('userPassword') || this.isNew) return next();

    // This ensures the token has been created after the password has changed
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.comparePassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfterTokenIssued = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimeStamp < changedTimeStamp;
    }
    return false; // Not changed
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
