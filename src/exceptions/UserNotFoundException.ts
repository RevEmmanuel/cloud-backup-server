import {CloudServerException} from "./GlobalException";

export class UserNotFoundException extends CloudServerException {

    constructor(message: string) {
        super(message, 404);
    }

}
