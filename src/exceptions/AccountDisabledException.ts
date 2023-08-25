import {CloudServerException} from "./GlobalException";

export class AccountDisabledException extends CloudServerException {

    constructor(message: string) {
        super(message, 403);
    }

}
