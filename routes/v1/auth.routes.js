import express from "express";
import {handleLogin, handleLogout} from "../../controllers/auth.controllers.js";
import { protectRoute } from "../../middleware/jwt.middleware.js";

const authRoutes = express.Router();

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     tags:
 *      - Authentication
 *     summary: Log Into Application
 *     description: Logs User Into Application
 *     parameters:
 *       - in: body
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Login Account Email
 *     responses:
 *       '200':
 *         description: A successful response
 *       '404':
 *         description: Employee not found
 *       '500':
 *         description: Internal server error
 */
authRoutes
    .route("/login")
    .post(handleLogin);

/**
 * @swagger
 * /v1/auth/logout:
 *   post:
 *     tags:
 *      - Authentication
 *     summary: Log Out From Application
 *     description: Logs User Out From Application
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Employee ID
 *     responses:
 *       '200':
 *         description: A successful response
 *       '404':
 *         description: Employee not found
 *       '500':
 *         description: Internal server error
 */
authRoutes
    .route("/logout")
    .post(protectRoute, handleLogout);

export default authRoutes;