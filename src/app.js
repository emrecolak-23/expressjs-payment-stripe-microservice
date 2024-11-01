"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
require("express-async-errors");
const amqplib_1 = __importDefault(require("amqplib"));
const mongoose_1 = __importDefault(require("mongoose"));
// Import Routes
const routes_1 = require("./routes");
// Import Middlewares
const middlewares_1 = require("./middlewares");
// Import Errors
const not_found_error_1 = require("./errors/not-found-error");
const swagger_1 = __importDefault(require("./utils/swagger"));
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config({ path: path_1.default.join(__dirname, "../.env.dev") });
}
else {
    dotenv_1.default.config({ path: path_1.default.resolve(__dirname, ".env") });
}
const app = (0, express_1.default)();
exports.app = app;
app.get("/payments-inmidi/healthcheck", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const healtStatus = { status: "OK" };
    try {
        const connection = yield amqplib_1.default.connect(process.env.AMQP_URI);
        healtStatus.amqp = "OK";
        connection.close();
    }
    catch (error) {
        healtStatus.amqp = "FAILED";
        res.status(500).json(healtStatus);
    }
    try {
        yield mongoose_1.default.connection.db.admin().ping();
        healtStatus.mongoDB = "OK";
    }
    catch (error) {
        console.log(error);
        healtStatus.mongoDB = "NOT OK";
        res.status(500).json(healtStatus);
    }
    res.json(healtStatus);
}));
app.use(middlewares_1.translations);
app.use(express_1.default.json({
    verify: (req, res, buf) => (req["rawBody"] = buf),
}));
app.use((0, cors_1.default)());
(0, swagger_1.default)(app, process.env.PORT ? parseInt(process.env.PORT) : 3000);
app.use("/", routes_1.routes);
app.all("*", (req, res, next) => {
    console.log("Route not found");
    throw new not_found_error_1.NotFoundError("route_not_found");
});
app.use(middlewares_1.errorHandler);
