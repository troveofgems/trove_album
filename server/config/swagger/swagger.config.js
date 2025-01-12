import swaggerJsDoc from 'swagger-jsdoc';

import path, { dirname } from "path";
import { fileURLToPath } from "url";

const
    __filename = fileURLToPath(import.meta.url),
    __dirname = dirname(__filename),
    swaggerOptions = {
        swaggerDefinition: {
            openApi: '3.0.0',
            info: {
                title: 'ToG Photo Gallery API',
                version: '1.0.0',
                description: 'Trove of Gems Photo Gallery API Documentation',
                license: {
                    name: "MIT",
                    url: "https://www.thetroveofgems.tech"
                },
                contact: {
                    name: 'Dustin Greco',
                    url: "https://www.thetroveofgems.tech",
                    email: "info@thecodebuzz.com"
                },
            },
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
            }
        },
        servers: [
            {
                url: process.env.NODE_ENV === "development" ? ('http://localhost:5000/') :
                    ('https://www.photo-album.thetroveofgems.tech'),
                name: process.env.NODE_ENV === "development" ? ('Development') :
                    ('Production')
            }
        ],
        apis: [`${path.resolve(__dirname, "..", "..", "routes", "v1", "*.routes.js")}`],
    };


export const swaggerDocs = swaggerJsDoc(swaggerOptions);
