import express from 'express';
import { attachUserData } from "../../middleware/jwt.middleware.js";
import { fetchGalleryPhotos, fetchPhotoById } from "../../controllers/gallery.controllers.js";

const galleryRouter = express.Router();

galleryRouter
    .route("/photos")
    /**
     * @swagger
     * /v1/api/gallery/photos:
     *   get:
     *     tags:
     *      - Photo Album - Public
     *     summary: Fetch Full Album
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
     *         description: Album Fetched
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
     *         description: Unable To Fetch Album
     *       '404':
     *         description: Resource Not Found
     *       '500':
     *         description: Internal server error
     */
    .get(attachUserData, fetchGalleryPhotos);

galleryRouter
    .route("/photos/:id")
    /**
     * @swagger
     * /v1/api/gallery/photos/{id}:
     *   get:
     *     tags:
     *      - Photo Album - Public
     *     summary: Fetch Photo By id From Photo Album
     *     description: Fetches A Single Photo By Its id From The Photo Album
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
    .get(fetchPhotoById);

export default galleryRouter;