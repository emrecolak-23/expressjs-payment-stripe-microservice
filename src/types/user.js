"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.UserTypes = void 0;
var UserTypes;
(function (UserTypes) {
    UserTypes["ISTEYIM"] = "ISTEYIM";
    UserTypes["INMIDI"] = "INMIDI";
    UserTypes["INMIDI_BACKOFFICE"] = "INMIDI_BACKOFFICE";
    UserTypes["ROLE_ADMIN"] = "ROLE_ADMIN";
    UserTypes["ROLE_INMIDI_BACKOFFICE_ADMIN"] = "ROLE_INMIDI_BACKOFFICE_ADMIN";
})(UserTypes || (exports.UserTypes = UserTypes = {}));
var UserRole;
(function (UserRole) {
    UserRole["ROLE_ISTEYIM_LEVEL_1"] = "ROLE_ISTEYIM_LEVEL_1";
    UserRole["ROLE_ISTEYIM_LEVEL_2"] = "ROLE_ISTEYIM_LEVEL_2";
    UserRole["ROLE_ADMIN"] = "ROLE_ADMIN";
    UserRole["ROLE_BACKOFFICE"] = "ROLE_BACKOFFICE";
    UserRole["ROLE_INMIDI_BACKOFFICE_ADMIN"] = "ROLE_INMIDI_BACKOFFICE_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
