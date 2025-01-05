import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API de Autenticación',
        version: '1.0.0',
        description: 'Documentación de la API para la autenticación de usuarios',
      },
    },
    apis: ['./src/swagger/**/*.ts'],
  };
  

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
