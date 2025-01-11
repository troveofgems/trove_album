import jwt from "jsonwebtoken";

export const assignToken = (user) => {
    const
        cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        },
        assignedToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

    return {
        cookieName: process.env.JWT_COOKIE_NAME,
        assignedToken,
        cookieOptions
    }
};

