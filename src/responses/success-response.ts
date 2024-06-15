class SuccessResponse {
    message;
    data;

    constructor(data: any, message?: string) {
        this.message = message;
        this.data = data;
    }

    toJSON() {
        return {
            message: this.message,
            data: this.data,
        };
    }
}

export default SuccessResponse