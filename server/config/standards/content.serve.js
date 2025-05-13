import express from "express";
import path, {dirname} from "path";
import {fileURLToPath} from "url";
import {mountErrorRoutes} from "../../routes/main.router.js";

export const assignAssets = (app) => {
    const
        isProduction = process.env.NODE_ENV === "production",
        __filename = fileURLToPath(import.meta.url),
        __dirname = dirname(__filename);

    if(isProduction) {
        app.use(express.static(path.join(__dirname, "..", "..", "..", "/client/build")));
        app.get("*", (req, res) => {
            return res.sendFile(path.resolve(__dirname, "..", "..", "..", "client", "build", "index.html"));
        });
    } else {
        app.get("/", (req, res, next) =>
            res
                .status(200)
                .json({
                    message: "Trove of Gems Photo Album Application & API Server Up and Running.",
                    urls: {
                        frontend: "http://localhost:3000",
                        backend: "http://localhost:5000",
                        swaggerDocs: "http://localhost:5000/api-docs"
                    },
                    statusCode: 200
            })
        );

        // DO NOT MODIFY CODE BELOW mountErrorRoutes():
        mountErrorRoutes(app);
    }

    return app;
}