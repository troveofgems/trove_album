import UserModel from "../db/models/user.model.js";
import {assignToken} from "../util/jwt.utils.js";

import {
    INVALID_CREDENTIALS,
    NO_CREDENTIALS_SUPPLIED
} from "../constants/app.error.message.constants.js";

// @access Public
export const handleLogin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        return next(new Error(NO_CREDENTIALS_SUPPLIED));
    }

    const
        user = await UserModel.findOne({ email }, null, null),
        passwordMatches = await user.matchPassword(password);

    if(user && passwordMatches) {
        const { cookieName, assignedToken, cookieOptions } = assignToken(user);
        return res
            .cookie(cookieName, assignedToken, cookieOptions)
            .status(200)
            .json({
                data: {
                    _id: user._id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    isAdmin: user.isAdmin
                }
            });
    } else {
        res.status(401);
        next(new Error(INVALID_CREDENTIALS));
    }
};

// @access Private
export const handleLogout = async (req, res, next) => {
    res.cookie(process.env.JWT_COOKIE_NAME, "", {
        httpOnly: true,
        expires: new Date()
    });

    return res
        .status(200)
        .json({
            message: "Logout Successful"
        });
};