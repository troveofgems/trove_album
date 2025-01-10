/*import dotenv from 'dotenv';
dotenv.config({ path: `./config/env/.env.${process.env.NODE_ENV}` });*/
import express from 'express';
import connectDB from "./db/db.config.js";
import {setApplicationStandardsAndLimits} from "./config/standards/set.application.standards.js";
import {enableApplicationSecurity} from "./config/security/enable.app.security.js";
import {mountMainRouter} from "./routes/main.router.js";

import path from "path";

const
    connections = { appServer: null, dbConn: null },
    port = process.env.PORT || 3003,
    app = express();

connectDB()
    .then(() => {
        setApplicationStandardsAndLimits(app);
        enableApplicationSecurity(app);

        if(process.env.NODE_ENV === "production") {
            app.use(express.static(path.join(__dirname, "/client/build")));
            app.get("*", (req, res, next) =>
            res.sendFile(path.resolve(__dirname, "client", "build", "index.html")));
        } else {
            app.get("/", (req, res, next) =>
                res.json({ message: "API Up and Running." })
            )
        }

        mountMainRouter(app);
        app.listen(port, () => {
            console.log(`✨ Photo Album Up & Running on port: ${port} ✨`);
        });
    })
    .catch(() => process.exit(1));