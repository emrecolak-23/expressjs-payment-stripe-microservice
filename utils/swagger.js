"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const package_json_1 = require("../../package.json");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "CV Service API",
            version: package_json_1.version,
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
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
function writeSwaggerSpecToFile() {
    const outputPath = path_1.default.join(process.cwd(), "openApi.json");
    console.log(outputPath, "outputpath");
    fs_1.default.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
    console.log(`Swagger JSON written to ${outputPath}`);
}
function swaggerDocs(app, port) {
    // Swagger Page
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    // Docs in JSON
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    writeSwaggerSpecToFile();
    console.log(`Swagger Docs: http://localhost:${port}/api-docs`);
}
exports.default = swaggerDocs;
