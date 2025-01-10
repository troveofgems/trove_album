export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404)
    next(error);
}

export const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Check for Mongoose Object Id Cast Error
    if(err.name === "CastError" && err.kind === "ObjectId") {
        message = 'Resource Not Found';
        statusCode = 404;
    }

    return res.status(statusCode).json({
        error: true,
        message,
        originalUrl: req.originalUrl,
        stack: process.env.NODE_ENV === "production" ? "Error Stack Concealed - Production" : err.stack
    });
}