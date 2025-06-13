const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review must not be empty'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, 'A score is required'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'A review must belong to a tour'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a user'],
        },
    },
    {
        // When a field is not stored in a database but calculated for
        // some other value then we need that to show up using the following code
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'userName',
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
