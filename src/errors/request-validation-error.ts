import { CustomError } from "./custom-error";

export class RequstValidationError extends CustomError {
    statusCode = 400

    constructor(public errors: { message: string }[]) {
        super('Invalid request parameter')

        Object.setPrototypeOf(this, RequstValidationError.prototype)
    }

    serializeErrors(): { message: string }[] {
        return this.errors.map(err => {
            return { message: err.message }
        })
    }
}