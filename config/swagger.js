import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documents for OpenSpace',
      version: '1.0.0',
      description: "API Documents used for OpenSpace",
    },
    server: [
      {
        url: 'http://localhost:8800',
      },
    ]
  },

  apis: [
    './routes/*.js'
  ]
}

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
