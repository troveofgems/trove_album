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
                    Filters:
                        {
                            description: "Available App Filters",
                            example: {

                            },
                            properties: {
                                category: {
                                    description: "Auto Filter By Category",
                                    example: "Travel",
                                    type: "string"
                                },
                                filterStr: {
                                    description: "User Provided Filter String",
                                    example: "'Lou' 2015..2017",
                                    type: "string"
                                },
                                by: {
                                    type: "object",
                                    properties: {
                                        exact: {
                                            description: "Filter Using Exact Pattern Matching",
                                            type: "object"
                                        },
                                        exclusion: {
                                            description: "Filter Using Exclusion Pattern Matching",
                                            type: "object"
                                        },
                                        fuzzy: {
                                            description: "Filter Using Fuzzy Pattern Matching",
                                            type: "object"
                                        },
                                        websiteOnly: {
                                            description: "Filter Only Using Website Data",
                                            type: "object"
                                        },
                                        allSites: {
                                            description: "Filter Across All Trove of Gems Websites",
                                            type: "object"
                                        },
                                        numberRange: {
                                            description: "Filter Using Year Range Pattern Matching",
                                            type: "object"
                                        },
                                        filetype: {
                                            description: "Filter By FileType Pattern Matching",
                                            type: "object"
                                        }
                                    }
                                },
                                sorting: {
                                    type: "object",
                                    properties: {
                                        by: {
                                            type: "object",
                                            properties: {
                                                ascending: {
                                                    type: "boolean"
                                                },
                                                descending: {
                                                    type: "boolean"
                                                },
                                                newest: {
                                                    type: "boolean"
                                                },
                                                oldest: {
                                                    type: "boolean"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                    "Backend - User":
                        {
                            description: "A User Object denotes a Registered User of This Application",
                            example: {
                                firstName: "Dustin",
                                lastName: "Greco",
                                email: "dkgreco@thetroveofgems.tech",
                                password: "***********",
                                isAdmin: true
                            },
                            properties:
                                {
                                    firstName: {
                                        description: "User First Name",
                                        example: "Dustin",
                                        type: "string"
                                    },
                                    lastName: {
                                        description: "User Last Name",
                                        example: "Greco",
                                        type: "string"
                                    },
                                    email: {
                                        description: "User Email",
                                        example: "dkgreco@thetroveofgems.tech",
                                        type: "string"
                                    },
                                    password: {
                                        description: "User Password",
                                        example: "***********",
                                        type: "string"
                                    },
                                    isAdmin: {
                                        description: "User is An App Administrator",
                                        example: true,
                                        type: "boolean"
                                    },
                                },
                            required: ["_id", "firstName", "lastName", "password", "email", "isAdmin"]
                        },
                    "Frontend - User":
                        {
                            description: "A User Object denotes a Registered User of This Application",
                            example: {
                                _id: "ObjectId('...')",
                                fullName: "Dustin Greco",
                                isAdmin: true
                            },
                            properties:
                                {
                                    _id: {
                                        description: "User Id",
                                        example: "ObjectId('...')",
                                        type: "string"
                                    },
                                    fullName: {
                                        description: "User's Full Name",
                                        example: "Dustin Greco",
                                        type: "string"
                                    },
                                    isAdmin: {
                                        description: "User's Authorization Level",
                                        example: true,
                                        type: "string"
                                    },
                                },
                            required: []
                        },
                    "Backend - Photo":
                        {
                            description: "Format of the Photo Object sent to the Backend, transformed to specifically meet the shape requirements of the MongoDB Photo Schema",
                            properties:
                                {
                                    captions: {
                                        type: "object",
                                        properties: {
                                            alt: {
                                                description: "Alt Text For Frontend Image Alt Attribute",
                                                example: "A picture of Louie (A blue-heeler lab mix) in his younger years",
                                                type: "string"
                                            },
                                            description: {
                                                description: "Text For Frontend Image Lightbox Description Attribute",
                                                example: "Louie sitting handsomely for a picture, right next to his couch.",
                                                type: "string"
                                            },
                                            title: {
                                                description: "Text For Frontend Image Lightbox Title Attribute",
                                                example: "Handsome Lou",
                                                type: "string"
                                            }
                                        },
                                        required: ["alt", "description", "title"]
                                    },
                                    dates: {
                                        type: "object",
                                        properties: {
                                            photoTakenOn: {
                                                description: "Original Date Detected from EXIF Data of Photo Processing",
                                                example: "10/1/2021, 7:48:29 PM",
                                                type: "string"
                                            },
                                            year: {
                                                description: "Parsed Year Detected from EXIF Data of Photo Processing Value [photoTakenOn]",
                                                example: 2025,
                                                type: "mixed"
                                            }
                                        },
                                        required: ["photoTakenOn", "year"]
                                    },
                                    device: {
                                        type: "object",
                                        properties: {
                                            make: {
                                                description: "Original Phone Make Detected from EXIF Data of Photo Processing",
                                                example: "Apple",
                                                type: "string"
                                            },
                                            model: {
                                                description: "Original Phone Model Detected from EXIF Data of Photo Processing",
                                                example: "iPhone XR",
                                                type: "string"
                                            }
                                        },
                                        required: []
                                    },
                                    dimensions: {
                                        type: "object",
                                        properties: {
                                            width: {
                                                description: "Original Width Detected from EXIF Data of Photo Processing",
                                                example: 250,
                                                type: "number"
                                            },
                                            height: {
                                                description: "Original Height Detected from EXIF Data of Photo Processing",
                                                example: 750,
                                                type: "number"
                                            },
                                            sizeInKB: {
                                                description: "Original Size in Kilobytes Detected from EXIF Data of Photo Processing",
                                                example: 491.604,
                                                type: "number"
                                            }
                                        },
                                        required: ["width", "height", "sizeInKB"]
                                    },
                                    download: {
                                        type: "object",
                                        properties: {
                                            url: {
                                                description: "Overrides the base url of the photo download from the provider to troveofgems - not currently used",
                                                example: "https://www.photo-album.thetroveofgems.tech/some/valid/url",
                                                type: "string"
                                            },
                                            filename: {
                                                description: "Overrides the generic filename upload of the provider (Usually some codename like aEzly8) to a more friendly download name. I.e. aEzly8.jpg downloads as: Louie.jpg",
                                                example: "louie_in_park",
                                                type: "string"
                                            }
                                        },
                                        required: ["filename"]
                                    },
                                    gps: {
                                        type: "object",
                                        properties: {
                                            type: {
                                                type: "string",
                                                description: "Point is used by MongoDB for Regional/Location Based Querying.",
                                                enum: ["Point"],
                                                example: "Point"
                                            },
                                            coordinates: {
                                                type: "array",
                                                items: {
                                                    description: "Coordinates Accepts Lat/Long in the Format [x, y]",
                                                    example: [81.45, -135.64],
                                                    type: "number",
                                                },
                                                minItems: 2,
                                                maxItems: 2
                                            },
                                            altitude: {
                                                description: "Stores any EXIF Data related to Altitude. Could be Unknown, An Actual Coordinate Point, Or Description",
                                                example: "Sea Level",
                                                type: "mixed"
                                            }
                                        },
                                        required: ["type", "coordinates", "altitude"]
                                    },
                                    provider: {
                                        example: {
                                            url: "https://imgbb.co/some/valid/url",
                                            publicOrBucketId: "aes4ei",
                                            name: "imgbb",
                                            deleteUrl: "https://imgbb.co/some/valid/url",
                                            status: "uploaded"
                                        },
                                        type: "object",
                                        properties: {
                                            url: {
                                                example: "https://some/valid/url",
                                                type: "string"
                                            },
                                            publicOrBucketId: {
                                                description: "Bucket Id Corresponds to Provider Specific Folder, example: aexis3 - Cloudinary Folder For Family & Friends Tagged Photos",
                                                example: "aexis3",
                                                type: "string"
                                            },
                                            name: {
                                                description: "Name of the Photo Hosting Provider",
                                                example: "imgbb",
                                                type: "string"
                                            },
                                            deleteUrl: {
                                                description: "Url Provided by the Photo Hosting Provider to Delete A Photo",
                                                example: "https://some/valid/url",
                                                type: "string"
                                            },
                                            status: {
                                                description: "Status of a Photo Undergoing Processing.",
                                                enum: ["completed", "error", "pending"],
                                                example: "pending",
                                                type: "string"
                                            }
                                        },
                                        required: ["url", "publicOrBucketId", "name", "deleteUrl", "status"]
                                    },
                                    srcSet: {
                                        description: "srcSet is provisioned by the backend post provider-processing, and set to the provider's results.",
                                        example: [
                                            { src: "providerUrl-Thumb", height: 250, width: 250 },
                                            { src: "providerUrl-Medium", height: 500, width: 500 },
                                            { src: "providerUrl-Full", height: 1000, width: 1000 }
                                        ],
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                "src": { type: "string", example: "providerUrl-Thumb" },
                                                "height": { type: "number", example: 250 },
                                                "width": { type: "number", example: 250},
                                            },
                                            required: ["src", "height", "width"]
                                        }
                                    },
                                    tags: {
                                        description: "Tags are used to filter photos into categories/set-up appropriate views on the front-end",
                                        type: "array",
                                        items: { type: "string", minLength: 1, maxLength: 25},
                                        example: ["Travel", "Cheekwood Estates", "Nashville, TN", "February 2024"],
                                        minItems: 1,
                                        maxItems: 5
                                    },
                                    user: {
                                        $ref: "#/components/schemas/Backend - User"
                                    }
                                },
                            required: [
                                "captions", "dates", "dimensions", "download", "gps", "provider",
                                "tags", "user"
                            ]
                        },
                    "Frontend - Photo":
                        {
                            description: "Format of the Photo Object sent to the Frontend, transformed to specifically meet the shape requirements of React-Photo-Album Rendering",
                            properties:
                                {
                                    __v: {
                                        description: "MongoDB Document Version",
                                        type: "number",
                                        example: 0
                                    },
                                    _id: {
                                        description: "MongoDB Document Id",
                                        type: "string",
                                        example: "681cc103e71ae17a4fc58d64"
                                    },
                                    createdAt: {
                                        description: "Timestamp of When Photo Was Added to MongoDB",
                                        type: "string",
                                        example: "5/8/25, 7:34 AM"
                                    },
                                    dates: {
                                        type: "object",
                                        properties: {
                                            photoTakenOn: {
                                                description: "Original Date Detected from EXIF Data of Photo Processing",
                                                example: "10/1/2021, 7:48:29 PM",
                                                type: "string"
                                            },
                                            year: {
                                                description: "Parsed Year Detected from EXIF Data of Photo Processing Value [photoTakenOn]",
                                                example: 2025,
                                                type: "mixed"
                                            }
                                        }
                                    },
                                    description: {
                                        description: "Text For Frontend Image Lightbox Description Attribute",
                                        example: "Louie sitting handsomely for a picture, right next to his couch.",
                                        type: "string"
                                    },
                                    device: {
                                        type: "object",
                                        properties: {
                                            make: {
                                                description: "Original Phone Make Detected from EXIF Data of Photo Processing",
                                                example: "Apple",
                                                type: "string"
                                            },
                                            model: {
                                                description: "Original Phone Model Detected from EXIF Data of Photo Processing",
                                                example: "iPhone XR",
                                                type: "string"
                                            }
                                        },
                                        required: []
                                    },
                                    download: {
                                        type: "object",
                                        properties: {
                                            url: {
                                                description: "Overrides the base url of the photo download from the provider to troveofgems - not currently used",
                                                example: "https://www.photo-album.thetroveofgems.tech/some/valid/url",
                                                type: "string"
                                            },
                                            filename: {
                                                description: "Overrides the generic filename upload of the provider (Usually some codename like aEzly8) to a more friendly download name. I.e. aEzly8.jpg downloads as: Louie.jpg",
                                                example: "louie_in_park",
                                                type: "string"
                                            }
                                        },
                                        required: []
                                    },
                                    gps: {
                                        type: "object",
                                        properties: {
                                            type: {
                                                type: "string",
                                                description: "Point is used by MongoDB for Regional/Location Based Querying.",
                                                enum: ["Point"],
                                                example: "Point"
                                            },
                                            coordinates: {
                                                description: "Coordinates Accepts Lat/Long in the Format [x, y]",
                                                type: "array",
                                                example: [81.45, -135.64],
                                                items: {
                                                    type: "number",
                                                },
                                                minItems: 1,
                                                maxItems: 1
                                            },
                                            altitude: {
                                                description: "Stores any EXIF Data related to Altitude. Could be Unknown, An Actual Coordinate Point, Or Description",
                                                example: "Sea Level",
                                                type: "mixed"
                                            },
                                            canMapCoords: {
                                                description: "Flag for Setting the Map Link",
                                                type: "boolean",
                                                example: true
                                            },
                                            mapLink: {
                                                description: "URL For Map",
                                                type: "string",
                                                example: "https://openstreetmap.org/?mlat=33.33&mlon=-111.862"
                                            }
                                        },
                                        required: []
                                    },
                                    height: {
                                        description: "Original Height Detected from EXIF Data of Photo Processing",
                                        example: 750,
                                        type: "number"
                                    },
                                    key: {
                                        description: "Constructed Unique Key For Photo Object and React Keys",
                                        type: "string",
                                        example: "08d647c4d"
                                    },
                                    order: {
                                        description: "Order of the Photo Extracted From MongoDB",
                                        type: "number",
                                        example: 1
                                    },
                                    provider: {
                                        example: {
                                            url: "https://imgbb.co/some/valid/url",
                                            publicOrBucketId: "aes4ei",
                                            name: "imgbb",
                                            deleteUrl: "https://imgbb.co/some/valid/url",
                                            status: "uploaded"
                                        },
                                        type: "object",
                                        properties: {
                                            url: {
                                                description: "Hosting Provider's Viewable URL For Photo Artifact",
                                                example: "https://some/valid/url",
                                                type: "string"
                                            },
                                            publicOrBucketId: {
                                                description: "Bucket Id Corresponds to Provider Specific Folder, example: aexis3 - Cloudinary Folder For Family & Friends Tagged Photos",
                                                example: "aexis3",
                                                type: "string"
                                            },
                                            name: {
                                                description: "Name of the Photo Hosting Provider",
                                                example: "imgbb",
                                                type: "string"
                                            },
                                            status: {
                                                description: "Status of a Photo Undergoing Processing.",
                                                enum: ["completed", "error", "pending"],
                                                example: "pending",
                                                type: "string"
                                            }
                                        },
                                        required: ["url", "publicOrBucketId", "name", "status"]
                                    },
                                    src: {
                                        type: "string",
                                        description: "Hosting Provider's Viewable URL For Photo Artifact",
                                        example: "https://some/valid/url"
                                    },
                                    srcSet: {
                                        description: "srcSet is provisioned by the backend post provider-processing, and set to the provider's results.",
                                        example: [
                                            { src: "providerUrl-Thumb", height: 250, width: 250 },
                                            { src: "providerUrl-Medium", height: 500, width: 500 },
                                            { src: "providerUrl-Full", height: 1000, width: 1000 }
                                        ],
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                "src": { type: "string", example: "providerUrl-Thumb" },
                                                "height": { type: "number", example: 250 },
                                                "width": { type: "number", example: 250},
                                            },
                                            required: ["src", "height", "width"]
                                        }
                                    },
                                    tags: {
                                        description: "Tags are used to filter photos into categories/set-up appropriate views on the front-end",
                                        type: "array",
                                        items: { type: "string", minLength: 1, maxLength: 25},
                                        example: ["Travel", "Cheekwood Estates", "Nashville, TN", "February 2024"],
                                        minItems: 1,
                                        maxItems: 5
                                    },
                                    title: {
                                        type: "string",
                                        example: "Cheekwood Estates Mansion",
                                        description: "Text For Frontend Image Lightbox Title Attribute"
                                    },
                                    user: {
                                        $ref: "#/components/schemas/Frontend - User"
                                    },
                                    width: {
                                        description: "Original Width Detected from EXIF Data of Photo Processing",
                                        example: 250,
                                        type: "number"
                                    },
                                },
                            required: [
                                "captions", "dates", "dimensions", "download", "gps", "provider",
                                "tags", "user"
                            ]
                        },
                    Pagination: {
                        description: "Pagination Object Utilized by the Client & Server.",
                        properties:
                            {
                                page: {
                                    description: "Current Page Index",
                                    example: 1,
                                    type: "number"
                                },
                                offset: {
                                    description: "Adds Offset to the DB Query",
                                    example: 0,
                                    type: "number"
                                },
                                maxPages: {
                                    description: "Total Pages Possible For Given Filter & Pagination Constraints",
                                    example: 1,
                                    type: "number"
                                },
                                limit: {
                                    description: "Adds Limit to the DB Query",
                                    example: 17,
                                    type: "number"
                                },
                            }
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
    encoding: "utf8",
    swaggerDefinition: swaggerOptions.swaggerDefinition,
    definition: {},
    apis: swaggerOptions.apis
});