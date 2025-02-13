import swaggerJsDoc from 'swagger-jsdoc';

import path, { dirname } from "path";
import { fileURLToPath } from "url";

const
    __filename = fileURLToPath(import.meta.url),
    __dirname = dirname(__filename),
    swaggerOptions = {
        swaggerDefinition: {
            openapi: "3.1.1",
            info: {
                title: 'ToG Photo Gallery API',
                description: 'Trove of Gems Photo Gallery API Documentation',
                termsOfService: "",
                contact: {
                    name: 'Dustin Greco',
                    url: "https://www.thetroveofgems.tech",
                    email: "dkgreco@thetroveofgems.tech"
                },
                license: {
                    name: "MIT",
                    url: "https://www.thetroveofgems.tech"
                },
                version: '0.0.1',
            },
            servers: [
                {
                    url: process.env.NODE_ENV === "development" ? ('http://localhost:5000/') :
                        ('https://www.photo-album.thetroveofgems.tech'),
                    description: process.env.NODE_ENV === "development" ? ('Development Server') :
                        ('Production Server')
                }
            ],
            components: {
                schemas: {
                    user:
                        {
                            properties:
                                {
                                    email: { type: "string" },
                                    password: { type: "string" }
                                },
                        },
                    photo:
                        {
                            properties:
                                {
                                    src: { type: "string" },
                                    alt: { type: "string" },
                                    width: { type: "number" },
                                    height: { type: "number" },
                                    srcSet: { type: "array" },
                                    captions: { type: "string" },
                                    download: { type: "string" }
                                },
                        }
                },
                securitySchemes: {
                    cookieAuth: {
                        type: "apiKey",
                        in: "cookie",
                        name: "JSESSIONID"
                    }
                }
            },
        },
        apis: [`${path.resolve(__dirname, "..", "..", "routes", "v1", "*.routes.js")}`]
    };


export const swaggerDocs = swaggerJsDoc({
    encoding: "utf-8",
    swaggerDefinition: swaggerOptions.swaggerDefinition,
    definition: {},
    apis: swaggerOptions.apis
});



/*


,
        definition: {},

components: {
    securitySchemes: {
        basicAuth: {
            type: "http"
        }
    },
    scheme: "basic",
        security: {
        basicAuth: []
    }
},

*/
