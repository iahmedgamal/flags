import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Flags API",
      version: "1.0.0",
      description: "Geography game API — flags, capitals, countries",
    },
    servers: [
      {
        url: "/api",
        description: "API server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
