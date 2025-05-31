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
                'https://fonts.googleapis.com',
                'https://cdn.jsdelivr.net',
                'https://cdnjs.cloudflare.com',
                'http://www.w3.org/2000/svg',
                'data:image/svg+xml',
                'http://www.w3.org/2000/svg',
                "'unsafe-inline'"
            ],
            styleSrcElem: [
                "'self'",
                'https://fonts.googleapis.com',
                'https://cdn.jsdelivr.net',
                'https://cdn.jsdelivr.net/npm/flotr2@0.1.0/flotr2.min.js',
                'https://cdnjs.cloudflare.com',
                'http://www.w3.org/2000/svg',
                'http://www.w3.org/1999/xlink',
                'data:image/svg+xml',
                'http://www.w3.org/2000/svg',
                "'unsafe-inline'"
            ],
            styleSrcAttr: [
                "'self'",
                'https://fonts.googleapis.com',
                'https://cdn.jsdelivr.net',
                'https://cdnjs.cloudflare.com',
                'http://www.w3.org/2000/svg',
                'http://www.w3.org/1999/xlink',
                'data:image/svg+xml',
                'http://www.w3.org/2000/svg',
                "'unsafe-inline'"
            ],
            scriptSrcElem: [
                "'self'",
                'https://fonts.googleapis.com',
                'https://cdn.jsdelivr.net',
                'https://cdn.jsdelivr.net/npm/flotr2@0.1.0/flotr2.min.js',
                "'unsafe-inline'"
            ],
            scriptSrc: [
                "'self'",
                'https://fonts.googleapis.com',
                'https://cdn.jsdelivr.net',
                'https://cdn.jsdelivr.net/npm/flotr2@0.1.0/flotr2.min.js',
                'https://cdnjs.cloudflare.com',
                'http://www.w3.org/2000/svg',
                'http://www.w3.org/1999/xlink',
                'data:image/svg+xml',
                'http://www.w3.org/2000/svg',
                "'unsafe-inline'"
            ],
            fontSrc: [
                "'self'",
                'https://fonts.gstatic.com'
            ],
            imgSrc: [
                "'self'",
                'https://vod.api.video',
                'https://res.cloudinary.com',
                'https://i.ibb.co',
                'data:'
            ],
            frameSrc: [
                "'self'",
                'https://embed.api.video'
            ]
        }
    };


    app.use(helmet({
        contentSecurityPolicy: cspConfig,
        /*reportOnly: true,
        reportUri: '/csp-violation-report'*/
    }));
    /*app.use((req, res, next) => {
        console.log('Current CSP headers:', res.get('Content-Security-Policy'));
        next();
    });*/
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
