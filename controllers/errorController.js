const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate fields: ${value}`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid Input Data. ${errors.join('.\n')}`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('Invalid token, please try logging in again', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired!\nPlease try logging in again', 401);

const sendErrorForDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
    });
};

const sendErrorForProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        console.error(err);

        return res.status(500).json({
            status: 'Error',
            message: 'Something went very wrong! 😥',
        });
    }
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message,
        });
    }
    console.error(err);

    return res.status(500).json({
        status: 'Error',
        message: 'Something went very wrong! 😥',
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorForDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        error.message = err.message;
        error.name = err.name;
        error.stack = err.stack;
        error.code = err.code;

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorForProd(error, req, res);
    }
};
