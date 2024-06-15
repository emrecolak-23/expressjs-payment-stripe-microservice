import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import { RequstValidationError } from "../errors/request-validation-error";
import { i18n } from "./translations";
const validate = (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
    const { value, error } = schema.validate(req.body, { abortEarly: false })

    if (error) {

        const translatedErrors = error.details.map((detail) => {
            const field = detail.context?.key || ""
            const content = detail.type

            let validValues

            if (content == "any.only") {
                validValues = detail.context?.valids.join(', ')
            }

            const translatedErrorMessage = i18n.__(content, {
                label: i18n.__(detail.context?.label!),
                limit: detail.context?.limit || 0,
                valids: validValues
            })

            return { message: translatedErrorMessage, field }
        })

        throw new RequstValidationError(translatedErrors)
    }

    Object.assign(req, value)
    return next()

}


export { validate }