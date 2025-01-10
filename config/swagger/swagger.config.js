import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
    swaggerDefinition: {
        openApi: '3.0.0',
        info: {
            title: 'ToG Photo Gallery API',
            version: '1.0.0',
            description: 'Trove of Gems Photo Gallery API Documentation',
            contact: {
                name: 'Dustin Greco'
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/',
                name: "Development"
            },
            {
                url: 'http://localhost:5005/',
                name: "UAT"
            },
        ],
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
    apis: ['./routes/v1/*.routes.js'],
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);


/*
components:
    securitySchemes:
        BasicAuth:
            type: http
scheme: basic
security:
    - BasicAuth: []*/
