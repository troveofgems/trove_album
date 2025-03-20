import express from 'express';
import connectDB from "./db/db.config.js";
import {setApplicationStandardsAndLimits} from "./config/standards/set.application.standards.js";
import {enableApplicationSecurity} from "./config/security/enable.app.security.js";
import {mountMainRouter} from "./routes/main.router.js";
import {assignAssets} from "./config/standards/content.serve.js";
import {setRedisClientForApplication} from "./services/redis.service.js";

const
    connections = { appServer: null, dbConn: null, redisClient: null },
    port = process.env.PORT || 3003,
    app = express();

//connectToRedis();
connectDB()
    .then((dbConn) => {
        connections.dbConn = dbConn;
        setApplicationStandardsAndLimits(app);
        setRedisClientForApplication(app);
        enableApplicationSecurity(app);
        mountMainRouter(app);
        assignAssets(app);

        app.listen(port, () => {
            connections.appServer = app;
            if(process.env.NODE_ENV === "development") {
                console.log(`✨. Photo Album Up & Running on port: ${port} ✨`);
            }
        });
    })
    .catch(() => process.exit(1));