import { Request, Response, NextFunction } from "express";
import { UserTypes } from "../types/user";

export const isCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user_type: userType, id: companyId } = req.currentUser;
  if (userType !== UserTypes.INMIDI) {
    return res
      .status(403)
      .json({ message: "You are not authorized to access this resource" });
  }

  next();
};
