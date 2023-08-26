import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Cloud Backup System',
            version: '1.0.0',
            description: 'This is a Node.js (TypeScript and Express) server application that serves as a cloud backup system.',

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
                    // Define properties of the CreateUserResponse schema
                },
            },
            LoginRequest: {
                type: 'object',
                properties: {

                },
            },
            CreateUserResponse: {
                type: 'object',
                properties: {

                },
            },
            CreateFolderResponse: {
                type: 'object',
                properties: {

                },
            },
            FindFileResponse: {
                type: 'object',
                properties: {

                },
            },
            FindFolderResponse: {
                type: 'object',
                properties: {

                },
            },
        },
    },
    externalDocs: {
        description: 'Postman Documentation',
        url: 'https://bit.ly/cloud-backup-server',
    },
    tags: [
        {
            name: 'Postman Documentation',
            description: 'Full Documentation available on Postman',
            externalDocs: {
                description: 'Postman Documentation',
                url: 'https://bit.ly/cloud-backup-server',
            },
        },
        {
            name: 'Landing Page',
            description: 'Home Page containing info',
            externalDocs: {
                description: 'Landing Page',
                url: 'https://cloud-backup-server-production.up.railway.app/',
            },
        },
        {
            name: 'Github Repository',
            description: 'Repository available publicly on GitHub',
            externalDocs: {
                description: 'Github Repository',
                url: 'https://github.com/RevEmmanuel/cloud-backup-server',
            },
        },
    ],
};


const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
