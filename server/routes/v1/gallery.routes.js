import express from 'express';
import { protectRoute, enforceAdminPrivilege } from "../../middleware/jwt.middleware.js";
import {
    addPhoto,
    deletePhoto,
    fetchGalleryPhotos,
    fetchPhotoById,
    updatePhoto
} from "../../controllers/gallery.controllers.js";
import {apiBenchmarkMiddleware} from "../../middleware/api.benchmark.middleware.js";


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
     *     parameters:
     *       - in: query
     *         name: fetchSettings
     *         schema:
     *             type: object
     *             properties:
     *               fetchSettings:
     *                 type: object
     *                 properties:
     *                   page:
     *                     type: number
     *                     example: 1
     *                   offset:
     *                     type: number
     *                     example: 0
     *                   maxPages:
     *                     type: number
     *                     example: 1
     *                   limit:
     *                     type: number
     *                     example: 17
     *                   filters:
     *                     type: object
     *                     example:
     *                       {
     *                          "category": "Travel",
     *                          "filterStr": "'Lou' 2015..2017",
     *                          "by": {
     *                              "exact": { "flagged": false, terms: null },
     *                              "fuzzy": {"flagged": false, terms: null },
     *                              "websiteOnly": {"flagged": false, terms: null },
     *                              "allSites": {"flagged": false, terms: null },
     *                              "numberRange": {"flagged": false, terms: null },
     *                              "filetype": {"flagged": false, terms: null },
     *                          },
     *                          "sorting": {
     *                              "by": {
     *                                  "ascending": false,
     *                                  "descending": false,
     *                                  "newest": false,
     *                                  "oldest": false,
     *                                  "order": false
     *                              }
     *                          }
     *                      }
     *     responses:
     *       '200':
     *         description: Gallery Fetched
     *         content:
     *           application/json:
     *             schema:
     *               type:
     *                 object
     *               properties:
     *                 data:
     *                   properties:
     *                     photos:
     *                       type: object
     *                       properties:
     *                         imageList:
     *                           type: array
     *                           items:
     *                             type: object
     *                             $ref: '#/components/schemas/Frontend - Photo'
     *                         groupMap:
     *                           type: object
     *                           properties:
     *                             type: array
     *                             items:
     *                               type: object
     *                           example:
     *                             { "February 2025 Nashville, TN": ['#/components/schemas/Frontend - Photo'] }
     *                         pullCount:
     *                           example: 1
     *                           type: number
     *                         totalPhotoCount:
     *                           example: 1
     *                           type: number
     *                         pagination:
     *                           $ref: '#/components/schemas/Pagination'
     *                 fetchTS:
     *                   example: "2025-05-13T19:14:47.686636752Z"
     *                   type: string
     *                 fromCache:
     *                   example: false
     *                   type: boolean
     *       '400':
     *         description: Unable To Fetch Gallery
     *       '404':
     *         description: Resource Not Found
     *       '500':
     *         description: Internal server error
     */
    .get(fetchGalleryPhotos)
    /**
     * @swagger
     * /v1/api/gallery/photos:
     *   post:
     *     tags:
     *      - Photo Gallery
     *     summary: Add Photo To Gallery
     *     description: Adds a Photo To The Gallery of Photos
     *     requestBody:
     *       description: Photo Request Object To Insert Into The Gallery
     *       content:
     *         multipart/form-data:
     *           schema:
     *             $ref: '#/components/schemas/photo'
     *           example:
     *     responses:
     *       '200':
     *         description: Photo Created For Gallery
     *       '400':
     *         description: Unable To Add Photo
     *       '404':
     *         description: Resource Not Found
     *       '500':
     *         description: Internal Server Error
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
     *     summary: Fetch Photo By id From Photo Gallery
     *     description: Fetches A Single Photo By Its id From The Photo Gallery
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: Photo ID
     *     responses:
     *       '200':
     *         description: Photo By Id Found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/photo'
     *       '400':
     *         description: Unable To Locate Photo By Id
     *       '404':
     *         description: Resource Not Found
     *       '500':
     *         description: Internal server error
     */
    .get(fetchPhotoById)
    /**
     * @swagger
     * /v1/api/gallery/photos/{id}:
     *   put:
     *     tags:
     *      - Photo Gallery
     *     summary: Update Photo By id Within Photo Gallery
     *     description: Updates A Single Photo By Its id From The Photo Gallery Using PUT Method
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
    .put(protectRoute, enforceAdminPrivilege, updatePhoto)
    /**
     * @swagger
     * /v1/api/gallery/photos/{id}:
     *   patch:
     *     tags:
     *      - Photo Gallery
     *     summary: Update Photo By id Within Photo Gallery
     *     description: Updates A Single Photo By Its id From The Photo Gallery Using PATCH Method
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
    .patch(protectRoute, enforceAdminPrivilege, updatePhoto)
    /**
     * @swagger
     * /v1/api/gallery/photos/{id}:
     *   delete:
     *     tags:
     *      - Photo Gallery
     *     summary: Delete Photo By id Within Photo Gallery
     *     description: Deletes a Photo By Its id From The Photo Gallery
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

export default galleryRouter;