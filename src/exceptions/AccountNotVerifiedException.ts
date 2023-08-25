import {CloudServerException} from "./GlobalException";

export class AccountNotVerifiedException extends CloudServerException {


    constructor(message: string) {
        super(message, 401);
    }

}
