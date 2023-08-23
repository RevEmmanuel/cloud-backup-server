import {CloudServerException} from "./GlobalException";

export class UnauthorizedException extends CloudServerException {

    constructor(message: string) {
        super(message, 401);
    }

}
