export class CloudServerException extends Error {
    statusCode: number;
    message: string;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'CloudServerException';
        this.statusCode = statusCode;
        this.message = message;
    }

}
