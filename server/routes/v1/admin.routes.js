import express from 'express';
import { protectRoute, enforceAdminPrivilege } from "../../middleware/jwt.middleware.js";
import { fetchGalleryPhotos } from "../../controllers/admin.controllers.js";

const galleryRouter = express.Router();

galleryRouter
    .route("/resource-management")
    .get(protectRoute, enforceAdminPrivilege, fetchGalleryPhotos);


export default galleryRouter;