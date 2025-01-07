import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Autenticación',
            version: '1.0.0',
            description: 'Documentación de la API para la autenticación de usuarios',
        },
    },
    apis: [
        process.env.NODE_ENV === 'production'
            ? path.join(__dirname, './swagger/**/*.js') // Para la carpeta dist
            : path.join(__dirname, './src/swagger/**/*.ts'), // Para el desarrollo
    ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
