import express from "express";
import cookieParser from "cookie-parser";

export const setApplicationStandardsAndLimits = (app) => {
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    app.use(cookieParser());
    /*app.enable('trust proxy', 2);*/
    return app;
}