import jwt from "jsonwebtoken";
import UserModel from "../db/models/user.model.js";
import { asyncHandler } from "./asyncHandler.middleware.js";

import {
    NOT_AUTHORIZED_NO_TOKEN_PROVIDED,
    NOT_AUTHORIZED_TOKEN_VALIDATION_FAILURE,
    NOT_AUTHORIZED_NOT_ADMINISTRATOR
} from "../constants/app.error.message.constants.js";

// Attach User Data Route
const attachUserData = asyncHandler(async (req, res, next) => {
    let token = null;

    token = req.cookies[`${process.env.JWT_COOKIE_NAME}`];

    if(token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = !!decoded ? await UserModel
            .findById(decoded.userId, null, null)
            .select("-password") : null;
        return next();
    } else {
        req.user = null;
        return next();
    }
});

// Protected Routes
const protectRoute = asyncHandler(async (req, res, next) => {
    let token = null;

    token = req.cookies[`${process.env.JWT_COOKIE_NAME}`];

    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await UserModel
                .findById(decoded.userId, null, null)
                .select("-password");
            return next();
        } catch(err) {
            if(process.env.NODE_ENV === "development") console.error(err);
            res.status(401);
            return next(new Error(NOT_AUTHORIZED_TOKEN_VALIDATION_FAILURE));
        }
    } else {
        res.status(401);
        return next(new Error(NOT_AUTHORIZED_NO_TOKEN_PROVIDED));
    }
});

// Admin Route Protection
const enforceAdminPrivilege = (req, res, next) => {
    if(req.user && req.user.isAdmin) {
        return next();
    } else {
        res.status(401);
        return next(new Error(NOT_AUTHORIZED_NOT_ADMINISTRATOR));
    }
}

export { protectRoute, enforceAdminPrivilege, attachUserData };