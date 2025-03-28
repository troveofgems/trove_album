import helmet from 'helmet';
import hpp from 'hpp';
import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: process.env.WINDOW_LIMIT * 60 * 1000,
    limit: process.env.MAX_API_REQUESTS_PER_WINDOW,
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
});

const isDevelopmentMode = process.env.NODE_ENV === 'development';

export const enableApplicationSecurity = (app) => {
    console.log("=> SECURITY PACKAGES");
    const cspConfig = {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                'https://fonts.googleapis.com'
            ],
            scriptSrc: [
                "'self'",
                'https://fonts.googleapis.com'
            ],
            fontSrc: [
                "'self'",
                'https://fonts.gstatic.com'
            ],
            imgSrc: [
                "'self'",
                'https://res.cloudinary.com',
                'data:'
            ]
        },
    };

    app.use(helmet({
        contentSecurityPolicy: cspConfig,
    }));
    if(isDevelopmentMode) {
        console.log("Helmet Enabled & Provided CSP Config");
    }

    app.use(hpp({}));
    if(isDevelopmentMode) {
        console.log("HPP Enabled!");
    }
/*    app.use(limiter);
    if(process.env.NODE_ENV === 'development') {
        console.log("Enabled: Express Rate Limiter");
    }*/

    if(isDevelopmentMode) console.log("");
    return app;
}
