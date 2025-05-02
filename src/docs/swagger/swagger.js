import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Définition des options de configuration pour Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Qualiextra API',
      version: '1.0.0',
      description: 'Documentation de l\'API Qualiextra',
    },
    servers: [
      { url: 'http://localhost:3000' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            firstname: { type: 'string' },
            lastname: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/controllers/*.js', './src/router.js'],
};

// Générer la spécification Swagger en utilisant les options définies ci-dessus
const swaggerSpec = swaggerJSDoc(options);

// Fonction pour configurer Swagger dans l'application Express
export function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

