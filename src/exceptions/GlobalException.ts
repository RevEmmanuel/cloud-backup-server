export class CloudServerException extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'CloudServerException';
        this.statusCode = statusCode;
    }

}
