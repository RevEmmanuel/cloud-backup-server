import {CloudServerException} from "./GlobalException";

export class IncorrectPasswordException extends CloudServerException {

    constructor(message: string) {
        super(message, 401);
    }

}

