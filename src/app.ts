import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import "express-async-errors";
import amqp from "amqplib";
import mongoose from "mongoose";

import { UserPayload } from "./types/user";

// Import Routes
import {
  paymentRoutes,
  orderRoutes,
  cartRoutes,
  checkoutRoutes,
  portalRotues,
  couponRoutes,
} from "./routes";

// Import Middlewares
import { errorHandler, translations } from "./middlewares";

// Import Errors
import { NotFoundError } from "./errors/not-found-error";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, "../.env.dev") });
} else {
  dotenv.config({ path: path.resolve(__dirname, ".env") });
}

declare global {
  namespace Express {
    interface Request {
      currentUser: UserPayload;
      language: string;
      token: string;
    }
  }
}

export interface CustomRequest extends Request {
  rawBody?: Buffer;
}

const app = express();
app.get("/payments-inmidi/healthcheck", async (req: Request, res: Response) => {
  const healtStatus: Record<string, string> = { status: "OK" };
  try {
    const connection = await amqp.connect(process.env.AMQP_URI!);
    healtStatus.amqp = "OK";
    connection.close();
  } catch (error) {
    healtStatus.amqp = "FAILED";
    res.status(500).json(healtStatus);
  }

  try {
    await mongoose.connection.db.admin().ping();
    healtStatus.mongoDB = "OK";
  } catch (error) {
    console.log(error);
    healtStatus.mongoDB = "NOT OK";
    res.status(500).json(healtStatus);
  }
  res.json(healtStatus);
});

app.use(translations);
app.use(
  express.json({
    verify: (req: CustomRequest, res: Response, buf: Buffer) =>
      (req["rawBody"] = buf),
  })
);
app.use(cors());
app.use("/inmidi-payments", paymentRoutes());
app.use("/inmidi-order", orderRoutes());
app.use("/inmidi-cart", cartRoutes());
app.use("/checkout", checkoutRoutes());
app.use("/inmidi-portal", portalRotues());
app.use("/inmidi-coupon", couponRoutes());

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  console.log("Route not found");
  throw new NotFoundError("route_not_found");
});

app.use(errorHandler);

export { app };
