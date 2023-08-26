import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Cloud Backup System',
            version: '1.0.0',
            description: 'This is a Node.js (TypeScript and Express) server application that serves as a cloud backup system.',
            contact: {
                name: "Adeola Adekunle",
                email: "adeolaae1@gmail.com",
                url: "https://github.com/RevEmmanuel",
            },
        },
        servers: [
            {
                description: 'Local Server',
                url: 'http://localhost:3000',
            },
            {
                description: 'Hosted Server',
                url: 'https://cloud-backup-server-production.up.railway.app',
            }
        ],
    },
    apis: ['src/controller/**/*.ts'],
    components: {
        schemas: {
            SignUpRequest: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        description: 'User email',
                    },
                    password: {
                        type: 'string',
                        description: 'User password',
                    },
                    fullName: {
                        type: 'string',
                        description: 'User full name',
                    },
                    isAdmin: {
                        type: 'boolean',
                        description: 'Indicates if user is an admin',
                    },
                },
            },
            LoginRequest: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        description: 'User email',
                    },
                    password: {
                        type: 'string',
                        description: 'User password',
                    },
                },
            },
            CreateUserResponse: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        description: 'User email',
                    },
                    id: {
                        type: 'number',
                        description: 'Id of the user in the db',
                    },
                    fullName: {
                        type: 'string',
                        description: 'User full name',
                    },
                    isVerified: {
                        type: 'boolean',
                        description: 'Indicates if user is verified',
                    },
                },
            },
            CreateFolderResponse: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number',
                        description: 'Id of folder',
                    },
                    name: {
                        type: 'string',
                        description: 'Name of folder',
                    },
                    slug: {
                        type: 'string',
                        description: 'Slug to identify folder',
                    },
                    dateUploaded: {
                        type: Date,
                        description: 'Indicates date folder was uploaded',
                    },
                    lastEditedOn: {
                        type: Date,
                        description: 'Indicates when last an action was performed on the folder'
                    }
                },
            },
            FindFileResponse: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number',
                        description: 'Id of file',
                    },
                    fileUrl: {
                        type: 'string',
                        description: 'Url to the file on the cloud',
                    },
                    slug: {
                        type: 'string',
                        description: 'Slug to identify folder',
                    },
                    dateUploaded: {
                        type: Date,
                        description: 'Indicates date file was uploaded',
                    },
                    originalFileName: {
                        type: 'string',
                        description: 'name of uploaded file',
                    },
                    fileType: {
                        type: 'string',
                        description: 'type of file uploaded',
                    },
                    isUnsafe: {
                        type: 'string',
                        description: 'indicates if file has been marked as unsafe',
                    }
                },
            },
            FindFolderResponse: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number',
                        description: 'Id of folder',
                    },
                    name: {
                        type: 'string',
                        description: 'Name of folder',
                    },
                    slug: {
                        type: 'string',
                        description: 'Slug to identify folder',
                    },
                    dateUploaded: {
                        type: Date,
                        description: 'Indicates date file was uploaded',
                    },
                    lastEditedOn: {
                        type: Date,
                        description: 'Indicates when last an action was performed on the folder'
                    }
                },
            },
        },
    },
    externalDocs: [
        {
            description: 'Postman Documentation',
            url: 'https://bit.ly/cloud-backup-server',
        },
        {
            description: 'Landing Info Page',
            url: 'https://cloud-backup-server-production.up.railway.app',
        },
    ],
};


const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
