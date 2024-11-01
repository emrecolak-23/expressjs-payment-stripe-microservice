import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";
import ErrorResponse from "../responses/error-response";

export const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err); // Pass the error to the default Express error handler
  }

  if (err instanceof CustomError) {
    res
      .status(err.statusCode)
      .json(new ErrorResponse("custom error", err.serializeErrors()));
  } else {
    res
      .status(400)
      .json(
        new ErrorResponse("Something went wrong", [{ message: err.message }])
      );
  }
};
