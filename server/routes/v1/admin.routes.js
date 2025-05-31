import express from 'express';
import { protectRoute, enforceAdminPrivilege } from "../../middleware/jwt.middleware.js";
import {
    fetchGalleryPhotos,
    addPhoto,
    updatePhotoUsingPut, updatePhotoUsingPatch,
    deletePhoto, addVideo
} from "../../controllers/admin.controllers.js";
import {uploadWithMulter} from "../../middleware/multer.middleware.js";
import {scanForViruses} from "../../middleware/virus.scanner.middleware.js";

const adminRouter = express.Router();

/**
 * Photo Management Routes
 * */
adminRouter
    .route("/resource-management")
    .get(protectRoute, enforceAdminPrivilege, fetchGalleryPhotos);

adminRouter
    .route("/resource-management/photos")
    /**
     * @swagger
     * /v1/api/admin/resource-management/photos:
     *   post:
     *     tags:
     *      - Photo Album - Admin
     *     summary: Add Photo To Album
     *     description: Adds a Photo To The Album of Photos
     *     requestBody:
     *       description: Photo Request Object To Insert Into The Album
     *       content:
     *         multipart/form-data:
     *           schema:
     *             $ref: '#/components/schemas/photo'
     *           example:
     *     responses:
     *       '200':
     *         description: Photo Created For Album
     *       '400':
     *         description: Unable To Add Photo
     *       '404':
     *         description: Resource Not Found
     *       '500':
     *         description: Internal Server Error
     */
    .post(protectRoute, enforceAdminPrivilege, addPhoto);

adminRouter
    .route("/resource-management/photos/:id")
    /**
     * @swagger
     * /v1/api/admin/resource-management/photos/{id}:
     *   put:
     *     tags:
     *     - Photo Album - Admin
     *     summary: Update Photo By id Within Photo Album
     *     description: Updates A Single Photo By Its id From The Photo Album Using PUT Method
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: Photo ID
     *     responses:
     *       '200':
     *         description: Photo Updated
     *       '400':
     *         description: Unable To Update Photo
     *       '404':
     *         description: Resource Not Found
     *       '500':
     *         description: Internal server error
     */
    .put(protectRoute, enforceAdminPrivilege, updatePhotoUsingPut)
    /**
     * @swagger
     * /v1/api/admin/resource-management/photos/{id}:
     *   patch:
     *     tags:
     *     - Photo Album - Admin
     *     summary: Update Photo By id Within Photo Album
     *     description: Updates A Single Photo By Its id From The Photo Album Using PATCH Method
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: Photo ID
     *     responses:
     *       '200':
     *         description: Photo Updated
     *       '400':
     *         description: Unable To Update Photo
     *       '404':
     *         description: Resource Not Found
     *       '500':
     *         description: Internal server error
     */
    .patch(protectRoute, enforceAdminPrivilege, updatePhotoUsingPatch)
    /**
     * @swagger
     * /v1/api/admin/resource-management/photos/{id}:
     *   delete:
     *     tags:
     *     - Photo Album - Admin
     *     summary: Delete Photo By id Within Photo Album
     *     description: Deletes a Photo By Its id From The Photo Album
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: Photo ID
     *     responses:
     *       '200':
     *         description: Photo Deleted
     *       '400':
     *         description: Unable To Delete Photo
     *       '403':
     *         description: Forbidden - Access Not Granted
     *       '404':
     *         description: Resource Not Found
     *       '500':
     *         description: Internal server error
     */
    .delete(protectRoute, enforceAdminPrivilege, deletePhoto);

/**
 * Video Management Routes
 * */
adminRouter
    .route("/resource-management/videos")
    /**
     * @swagger
     * /v1/api/admin/resource-management/photos:
     *   post:
     *     tags:
     *      - Photo Album - Admin
     *     summary: Add Photo To Album
     *     description: Adds a Photo To The Album of Photos
     *     requestBody:
     *       description: Photo Request Object To Insert Into The Album
     *       content:
     *         multipart/form-data:
     *           schema:
     *             $ref: '#/components/schemas/photo'
     *           example:
     *     responses:
     *       '200':
     *         description: Photo Created For Album
     *       '400':
     *         description: Unable To Add Photo
     *       '404':
     *         description: Resource Not Found
     *       '500':
     *         description: Internal Server Error
     */
    .post(protectRoute, enforceAdminPrivilege, uploadWithMulter.single("video"), scanForViruses, addVideo);

/**
 * User Management Routes
 * */

export default adminRouter;