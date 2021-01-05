import { ApiRequest } from '@/classes/Api/ApiRequest';

export class ApiError extends Error {
    public response: any;

    public request: ApiRequest;

    /**
     * @param {string} message
     * @param {object} [response]
     * @param {{method: string, url: string, params: object, headers: object}} [request]
     */
    constructor(message: string, response: any, request: ApiRequest) {
        super(message);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, Error.prototype);

        this.message = message;
        this.name = 'ApiError';
        this.response = response;
        this.request = request;
        this.stack = (new Error(this.message)).stack;
    }
}

// ApiError.prototype = Object.create(Error.prototype);
// ApiError.prototype.constructor = ApiError;
