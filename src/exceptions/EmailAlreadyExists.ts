import {CloudServerException} from "./GlobalException";

export class EmailAlreadyExistsException extends CloudServerException {

    constructor(message: string) {
        super(message, 400);
    }

}
