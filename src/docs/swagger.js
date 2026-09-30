const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "KhetiX Smart Farming API",
      version: "1.0.0",
      description:
        "REST API for KhetiX Smart Farming IoT Platform"
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },

  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;