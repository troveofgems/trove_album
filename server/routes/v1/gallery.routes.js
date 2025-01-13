import express from 'express';
import { protectRoute, enforceAdminPrivilege } from "../../middleware/jwt.middleware.js";
import {addPhoto, deletePhoto, fetchGalleryPhotos, updatePhoto} from "../../controllers/gallery.controllers.js";
import {cacheMiddleware} from "../../middleware/cache.middleware.js";

const galleryRouter = express.Router();

galleryRouter
    .route("/photos")
    /**
     * @swagger
     * /v1/api/gallery/photos:
     *   get:
     *     tags:
     *      - Photo Gallery
     *     summary: Fetch Full Gallery
     *     description: Fetches all photos from the gallery
     *     responses:
     *       '200':
     *         description: A successful response
     *       '404':
     *         description: Photo Gallery Not Found
     *       '500':
     *         description: Internal server error
     */
    .get(cacheMiddleware, fetchGalleryPhotos)
    /**
     * @swagger
     * /v1/api/gallery/photos:
     *   post:
     *     tags:
     *      - Photo Gallery
     *     summary: Fetch Gallery
     *     description: Fetches All Gallery Photos
     *     responses:
     *       '200':
     *         description: A successful response
     *       '404':
     *         description: Employee not found
     *       '500':
     *         description: Internal server error
     */
    .post(protectRoute, enforceAdminPrivilege, addPhoto);

galleryRouter
    .route("/photos/:id")
    /**
     * @swagger
     * /v1/api/gallery/photos/{id}:
     *   get:
     *     tags:
     *      - Photo Gallery
     *     summary: Fetch Full Gallery
     *     description: Fetches all photos from the gallery
     *     responses:
     *       '200':
     *         description: A successful response
     *       '404':
     *         description: Photo Gallery Not Found
     *       '500':
     *         description: Internal server error
     */
    .get(cacheMiddleware, fetchGalleryPhotos)
    /**
     * @swagger
     * /v1/api/gallery/photos/{id}:
     *   put:
     *     tags:
     *      - Photo Gallery
     *     summary: Update Photo
     *     description: Updates A Photo
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: Photo ID
     *     responses:
     *       '200':
     *         description: A successful response
     *       '404':
     *         description: Employee not found
     *       '500':
     *         description: Internal server error
     */
    .put(protectRoute, enforceAdminPrivilege, updatePhoto)
    /**
     * @swagger
     * /v1/api/gallery/photos/{id}:
     *   patch:
     *     tags:
     *      - Photo Gallery
     *     summary: Update Photo
     *     description: Updates A Photo
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: Photo ID
     *     responses:
     *       '200':
     *         description: A successful response
     *       '404':
     *         description: Employee not found
     *       '500':
     *         description: Internal server error
     */
    .patch(protectRoute, enforceAdminPrivilege, updatePhoto)
    /**
     * @swagger
     * /v1/api/gallery/photos/{id}:
     *   delete:
     *     tags:
     *      - Photo Gallery
     *     summary: Delete Photo
     *     description: Deletes a Photo
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: Photo ID
     *     responses:
     *       '200':
     *         description: A successful response
     *       '404':
     *         description: Employee not found
     *       '500':
     *         description: Internal server error
     */
    .delete(protectRoute, enforceAdminPrivilege, deletePhoto)

export default galleryRouter;