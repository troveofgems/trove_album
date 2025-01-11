import swaggerUi from 'swagger-ui-express';

import { default as AuthRoutes } from "./v1/auth.routes.js";
import { default as GalleryRoutes } from "./v1/gallery.routes.js";
import { default as OnRenderRoutes } from "./v1/render.routes.js";

import {swaggerDocs} from "../config/swagger/swagger.config.js";
import {notFound, errorHandler} from "../middleware/error.middleware.js";

export const mountMainRouter = (app) => {
    const
        apiVersion = process.env.API_VERSION,
        backend_apiRoutes = [
            {
                route: `/${apiVersion}/auth`,
                routeLoader: AuthRoutes
            },
            {
                route: `/${apiVersion}/gallery`,
                routeLoader: GalleryRoutes
            },
            {
                route: `/${apiVersion}/onRender`,
                routeLoader: OnRenderRoutes
            }
    ];

    if(process.env.NODE_ENV === "development") console.log("=============APP ROUTES=================");

    backend_apiRoutes.forEach(apiRoute => {
        if(process.env.NODE_ENV === "development") console.log("Mounted:", `${apiRoute.route}`);
        app.use(`${apiRoute.route}`, apiRoute.routeLoader);
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    return app;
}