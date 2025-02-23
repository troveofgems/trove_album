import express from "express";
import ExpressMongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import compression from "compression";

export const setApplicationStandardsAndLimits = (app) => {
    // Express Settings
    app.use(express.json({ limit: process.env.REQUEST_MAX_LIMIT }));
    app.use(express.urlencoded({ limit: process.env.REQUEST_MAX_LIMIT, extended: true }));

    // Main Request Sanitizer
    app.use(ExpressMongoSanitize({
        //allowDots: true,
        //replaceWith: '_',
        onSanitize: ({ req, key }) => {
            console.warn(`This request[${key}] will be sanitized`, req);
        },
    }));

    // Proxy, Parsers, and Compression
    app.use(cookieParser());
    app.use(compression());
    //app.enable('trust proxy', 2);
    return app;
}