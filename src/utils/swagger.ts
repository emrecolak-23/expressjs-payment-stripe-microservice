import { Application, Request, Response } from "express";
import fs from "fs";
import path from "path";
import swaggerJSDoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CV Service API",
      version,
      description: "API for file control service",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Authentication using Bearer token",
        },
      },
    },
    security: [
      {
        bearerAuth: [], // 'cookieAuth' -> 'bearerAuth'
      },
    ],
  },
  apis: ["src/routes/*.ts", "src/dtos/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

function writeSwaggerSpecToFile() {
  const outputPath = path.join(process.cwd(), "openApi.json");
  console.log(outputPath, "outputpath");
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

  console.log(`Swagger JSON written to ${outputPath}`);
}

function swaggerDocs(app: Application, port: number) {
  // Swagger Page
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Docs in JSON
  app.get("/api-docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  writeSwaggerSpecToFile();
  console.log(`Swagger Docs: http://localhost:${port}/api-docs`);
}

export default swaggerDocs;
