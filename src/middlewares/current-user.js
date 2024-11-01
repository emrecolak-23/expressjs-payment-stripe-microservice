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
exports.currentUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const not_authorized_error_1 = require("../errors/not-authorized-error");
const user_1 = require("../types/user");
const currentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // const consulClient = consulInstance.getConsulClient();
    // const kvConfig = process.env.KV_PATH || "config/general/secret";
    // const jwtKey = await consulClient.kv.get(kvConfig);
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return next();
    }
    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
        return res.status(401).json({ error: "Invalid Bearer token format" });
    }
    try {
        // const decodedKey = Buffer.from(jwtKey.Value, "base64");
        // const payload = jwt.verify(token, decodedKey, {
        //   algorithms: ["HS384"],
        // }) as UserPayload;
        const payload = jsonwebtoken_1.default.decode(token);
        if (payload.user_type === user_1.UserTypes.INMIDI ||
            payload.user_type === user_1.UserTypes.INMIDI_BACKOFFICE ||
            payload.auth === user_1.UserTypes.ROLE_ADMIN) {
            req.currentUser = {
                id: payload.id,
                role: payload.auth,
                user_type: payload.user_type,
                sub: payload.sub,
            };
            req.token = token;
            return next();
        }
        else {
            throw new not_authorized_error_1.NotAuthorizedError("User Invalid");
        }
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new not_authorized_error_1.NotAuthorizedError("Token expired");
        }
        else if ((_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) {
            throw new not_authorized_error_1.NotAuthorizedError(error.response.data.error);
        }
        else {
            console.log(error);
            throw new not_authorized_error_1.NotAuthorizedError("Token Invalid");
        }
    }
});
exports.currentUser = currentUser;
