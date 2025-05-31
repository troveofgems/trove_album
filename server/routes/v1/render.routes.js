import express from 'express';
import {OnRenderHealthCheckEndpoint} from "../../controllers/onRender.controllers.js";

const onRenderServiceRouter = express.Router();

/**
 * @swagger
 * /v1/api/onRender/health-check:
 *   get:
 *     tags:
 *      - Application Health Check
 *     summary: Check Application Health
 *     description: Health Check Always returns 200 Response Unless Application Is Down; Used by Render.com For Periodic Health Checks
 *     responses:
 *       '200':
 *         description: A successful response
 *       '500':
 *         description: Internal server error
 */
onRenderServiceRouter
    .route("/health-check")
    .get(OnRenderHealthCheckEndpoint);

export default onRenderServiceRouter;