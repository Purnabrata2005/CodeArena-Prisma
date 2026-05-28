class ApiResponse {
    statusCode;
    message;
    data;
    success;
    constructor(statusCode, message = "Success", data = {}) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = true;
    }
}
export { ApiResponse };
//# sourceMappingURL=api-response.js.map