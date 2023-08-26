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
                url: 'http://localhost:3000',
            },
            {
                url: 'https://cloud-backup-server-production.up.railway.app',
            }
        ],
    },
    apis: ['src/controller/**/*.ts'],
};



const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
