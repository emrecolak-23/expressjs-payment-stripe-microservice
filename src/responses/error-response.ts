class ErrorResponse extends Error {
    message: string;
    data?: { message: string }[]

    constructor(message: string, data?: { message: string }[]) {
        super(message);
        this.data = data
        this.message = message;
    }

    toJSON() {
        return {
            data: {
                errors: this.data
            }
        };
    }
}

export default ErrorResponse