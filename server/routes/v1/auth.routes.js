import express from "express";
import {handleLogin, handleLogout} from "../../controllers/auth.controllers.js";
import { protectRoute } from "../../middleware/jwt.middleware.js";

const authRoutes = express.Router();

/**
 * @swagger
 * /v1/api/auth/login:
 *   post:
 *     tags:
 *      - Authentication
 *     summary: Log Into Application
 *     description: Logs User Into Application
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 description: Login Email Address
 *                 type: string
 *               password:
 *                 description: Login Password
 *                 type: string
 *           required:
 *             - email
 *             - password
 *     responses:
 *       '200':
 *         description: Login Successful & Token Generated
 *       '400':
 *         description: Invalid User Credentials
 *       '404':
 *         description: Invalid User Credentials
 *       '500':
 *         description: Internal server error
 */
authRoutes
    .route("/login")
    .post(handleLogin);

/**
 * @swagger
 * /v1/api/auth/logout:
 *   post:
 *     tags:
 *      - Authentication
 *     summary: Log Out From Application
 *     description: Logs User Out From Application
 *     responses:
 *       '200':
 *         description: Logout Successful
 *       '400':
 *         description: Unable To Log Out From Account
 *       '500':
 *         description: Internal server error
 */
authRoutes
    .route("/logout")
    .post(protectRoute, handleLogout);

export default authRoutes;