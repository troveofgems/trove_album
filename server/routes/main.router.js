import swaggerUi from 'swagger-ui-express';

import { default as AuthRoutes } from "./v1/auth.routes.js";
import { default as GalleryRoutes } from "./v1/gallery.routes.js";
import { default as OnRenderRoutes } from "./v1/render.routes.js";

import {swaggerDocs} from "../config/swagger/swagger.config.js";
import {errorHandler, notFound} from "../middleware/error.middleware.js";

const isDevelopmentMode = process.env.NODE_ENV === "development";

export const mountMainRouter = (app) => {
    const
        apiVersionRoute = `${process.env.API_VERSION}/api`,
        backend_apiRoutes = [
            {
                route: `/${apiVersionRoute}/auth`,
                routeLoader: AuthRoutes
            },
            {
                route: `/${apiVersionRoute}/gallery`,
                routeLoader: GalleryRoutes
            },
            {
                route: `/${apiVersionRoute}/onRender`,
                routeLoader: OnRenderRoutes
            }
    ];

    if(isDevelopmentMode) console.log("=> APP ROUTES");
    backend_apiRoutes.forEach(apiRoute => {
        if(isDevelopmentMode) console.log("Mounted:", `${apiRoute.route}`);
        app.use(`${apiRoute.route}`, apiRoute.routeLoader);
    });

    if(isDevelopmentMode) {
        console.log("");
        if(isDevelopmentMode) console.log("=> SWAGGER UI");
    }

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: false }));
    if(isDevelopmentMode) {
        console.log("http://localhost:5000/api-docs");
        if(isDevelopmentMode) console.log("");
    }

    return app;
}

export const mountErrorRoutes = (app) => {
    if(process.env.NODE_ENV === "development") {
        console.log("=> App Error Routing");
        console.log("Mounted: <NotFound|GenericErrorHandler>");
        console.log("");
    }

    app.use(notFound);
    app.use(errorHandler);

    return app;
}