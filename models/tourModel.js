const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'How long does it take to complete?'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'Maximum number of participants'],
        },
        difficulty: {
            type: String,
            required: [true, 'How difficult is it?'],
            enum: {
                values: ['easy', 'medium', 'hard'],
                message: 'Difficulty can only be "easy", "medium" or "hard"',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 0,
            min: [1, 'Ratings must be above 1.0'],
            max: [5, 'Ratings must be less than 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // this only points to current doc on NEW doc creation
                    return val < this.price;
                },
                message: "The discount can't be greater than the price",
            },
        },
        summary: {
            type: String,
            required: [true, 'What is this tour about?'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'A tour must have a description'],
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have an image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now,
            select: false,
        },
        startDates: [Date],
        secretTours: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// This property is not actually part of the database
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Document middleware: runs before .save() and .create() but not for .update()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// This allows you to create a secret that won't be shown
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
