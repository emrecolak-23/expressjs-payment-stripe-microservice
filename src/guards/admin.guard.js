"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const user_1 = require("../types/user");
const isAdmin = (req, res, next) => {
    const { role } = req.currentUser;
    console.log(role, "role");
    if (role === user_1.UserTypes.ROLE_INMIDI_BACKOFFICE_ADMIN) {
        return next();
    }
    return res
        .status(403)
        .json({ message: "You are not allowed to access this resource" });
};
exports.isAdmin = isAdmin;
