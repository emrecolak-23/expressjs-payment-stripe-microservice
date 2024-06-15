import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";
import ErrorResponse from "../responses/error-response";

export const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res
      .status(err.statusCode)
      .json(new ErrorResponse("custom error", err.serializeErrors()));
  }

  res
    .status(400)
    .json(new ErrorResponse(err.message, [{ message: err.message }]));
};
