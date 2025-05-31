import express from "express";
import {handleLogin, handleLogout} from "../../controllers/auth.controllers.js";
import { protectRoute } from "../../middleware/jwt.middleware.js";

const authRouter = express.Router();

/**
 * @swagger
 * /v1/api/auth/login:
 *   post:
 *     tags:
 *      - Authentication
 *     security: []
 *     summary: Log Into Application
 *     description: Begins an Application Session For Given User Account Upon Successful Login
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 description: Account Email Address
 *                 type: string
 *                 example: dkgreco@emailProvider.com
 *               password:
 *                 description: Account Password
 *                 type: string
 *                 example: "**********"
 *           required:
 *             - email
 *             - password
 *     responses:
 *       '200':
 *         description: Login Successful & Token Generated
 *         headers:
 *           Authorization:
 *             description: JWT Token
 *             schema:
 *               type: string
 *               format: bearerToken
 *               example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         content:
 *           application/json:
 *             schema:
 *               type:
 *                 object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "679090f80d54bb5920929s8f"
 *                     name:
 *                       type: string
 *                       example: "Dustin Greco"
 *                     email:
 *                       type: string
 *                       example: "dkgreco@thetroveofgems.tech"
 *                     isAdmin:
 *                       type: boolean
 *                       example: true
 *       '400':
 *         description: Invalid User Credentials
 *         content:
 *           application/json:
 *             schema:
 *               type:
 *                 object
 *               properties:
 *                 error:
 *                   description: Flag Field For Error Handling
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   description: Server Error Message
 *                   type: string
 *                   example: "Invalid Credentials"
 *                 originalUrl:
 *                   description: API Url Requested
 *                   type: string
 *                   example: "/v1/api/auth/login"
 *                 stack:
 *                   description: Full Error Stack
 *                   type: string
 *                   example: "Error: Invalid Credentials at handleLogin..."
 *       '404':
 *         description: Invalid Request Path
 *         content:
 *           application/json:
 *             schema:
 *               type:
 *                 object
 *               properties:
 *                 error:
 *                   description: Flag Field For Error Handling
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   description: Server Error Message
 *                   type: string
 *                   example: "Not Found - /v1/api/auth/logins"
 *                 originalUrl:
 *                   description: API Url Requested
 *                   type: string
 *                   example: "/v1/api/auth/login"
 *                 stack:
 *                   description: Full Error Stack
 *                   type: string
 *                   example: "Error: Not Found - /v1/api/auth/logins..."
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type:
 *                 object
 *               properties:
 *                 error:
 *                   description: Flag Field For Error Handling
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   description: Server Error Message
 *                   type: string
 *                   example: "Internal Server Error"
 *                 originalUrl:
 *                   description: API Url Requested
 *                   type: string
 *                   example: "/v1/api/auth/login"
 *                 stack:
 *                   description: Full Error Stack
 *                   type: string
 *                   example: "Error: Internal Server Error..."
 */
authRouter
    .route("/login")
    .post(handleLogin);

/**
 * @swagger
 * /v1/api/auth/logout:
 *   post:
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - Authentication
 *     summary: Log Out From Application
 *     description: Terminates User's Application Session
 *     responses:
 *       '200':
 *         description: Logout Successful
 *         content:
 *           application/json:
 *             schema:
 *               type:
 *                 object
 *               properties:
 *                 message:
 *                   description: Server Message Response
 *                   type: string
 *                   example: Logout Successful
 *       '400':
 *         description: Unable To Log Out From Account
 *       '401':
 *         description: No Cookie Provided - Unable To Logout
 *         content:
 *           application/json:
 *             schema:
 *               type:
 *                 object
 *               properties:
 *                 error:
 *                   description: Flag Field For Error Handling
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   description: Server Error Message
 *                   type: string
 *                   example: "Unauthorized: No Token Provided"
 *                 originalUrl:
 *                   description: API Url Requested
 *                   type: string
 *                   example: "/v1/api/auth/logout"
 *                 stack:
 *                   description: Full Error Stack
 *                   type: string
 *                   example: "Error: Unauthorized: No Token Provided..."
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type:
 *                 object
 *               properties:
 *                 error:
 *                   description: Flag Field For Error Handling
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   description: Server Error Message
 *                   type: string
 *                   example: "Internal Server Error"
 *                 originalUrl:
 *                   description: API Url Requested
 *                   type: string
 *                   example: "/v1/api/auth/logout"
 *                 stack:
 *                   description: Full Error Stack
 *                   type: string
 *                   example: "Error: Internal Server Error..."
 */
authRouter
    .route("/logout")
    .post(protectRoute, handleLogout);

export default authRouter;