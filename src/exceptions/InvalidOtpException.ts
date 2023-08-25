import {CloudServerException} from "./GlobalException";

export class InvalidOtpException extends CloudServerException {


    constructor(message: string) {
        super(message, 401);
    }

}
