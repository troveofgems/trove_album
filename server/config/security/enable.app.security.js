import helmet from 'helmet';
import hpp from 'hpp';
import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: process.env.WINDOW_LIMIT * 60 * 1000,
    limit: process.env.MAX_API_REQUESTS_PER_WINDOW,
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
})

export const enableApplicationSecurity = (app) => {
    app.use(helmet());
    if(process.env.NODE_ENV === 'development') {
        console.log("===========SECURITY PACKAGES============");
        console.log("Enabled: Helmet");
    }
    app.use(hpp({}));
    if(process.env.NODE_ENV === 'development') {
        console.log("Enabled: HPP");
    }
/*    app.use(limiter);
    if(process.env.NODE_ENV === 'development') {
        console.log("Enabled: Express Rate Limiter");
    }*/
    return app;
}
