import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { consulInstance } from "..";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import { UserTypes, UserPayload } from "../types/user";

export const currentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const consulClient = consulInstance.getConsulClient();
  // const kvConfig = process.env.KV_PATH || "config/general/secret";
  // const jwtKey = await consulClient.kv.get(kvConfig);
  const authHeader: any = req.headers["authorization"];
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
    const payload = jwt.decode(token) as any;

    if (
      payload.user_type === UserTypes.INMIDI ||
      payload.user_type === UserTypes.INMIDI_BACKOFFICE ||
      payload.auth === UserTypes.ROLE_ADMIN
    ) {
      req.currentUser = {
        id: payload.id,
        role: payload.auth,
        user_type: payload.user_type,
        sub: payload.sub,
      };

      req.token = token;
      return next();
    } else {
      throw new NotAuthorizedError("User Invalid");
    }
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new NotAuthorizedError("Token expired");
    } else if (error?.response?.data?.error) {
      throw new NotAuthorizedError(error.response.data.error);
    } else {
      console.log(error);
      throw new NotAuthorizedError("Token Invalid");
    }
  }
};
