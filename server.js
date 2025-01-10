dotenv.config({ path: `./config/env/.env.${process.env.NODE_ENV}` });
import dotenv from 'dotenv';
import express from 'express';
import connectDB from "./db/db.config.js";
import {setApplicationStandardsAndLimits} from "./config/standards/set.application.standards.js";
import {enableApplicationSecurity} from "./config/security/enable.app.security.js";
import {mountMainRouter} from "./routes/main.router.js";

const
    connections = { appServer: null, dbConn: null },
    port = process.env.PORT || 3003,
    app = express();

connectDB()
    .then(() => {
        setApplicationStandardsAndLimits(app);
        enableApplicationSecurity(app);
        mountMainRouter(app);
        app.listen(port, () => {
            console.log(`✨ Photo Album Up & Running on port: ${port} ✨`);
        });
    })
    .catch(() => process.exit(1));