import express from 'express';
import {OnRenderHealthCheckEndpoint} from "../../controllers/onRender.controllers.js";

const onRenderRouter = express.Router();

/**
 * @swagger
 * /v1/onRender/health-check:
 *   get:
 *     tags:
 *      - Application Health Check
 *     summary: Check Application Health
 *     description: Health Check Always returns 200 response
 *     responses:
 *       '200':
 *         description: A successful response
 *       '500':
 *         description: Internal server error
 */
onRenderRouter
    .route("/health-check")
    .get(OnRenderHealthCheckEndpoint);

export default onRenderRouter;