class ApiResponse {
    constructor(statusCode, data, message = "Success", meta = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        if (meta) {
            this.meta = meta;
        }
        this.success = statusCode < 400;
    }
}
export { ApiResponse };