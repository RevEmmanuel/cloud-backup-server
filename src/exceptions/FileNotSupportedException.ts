import {CloudServerException} from "./GlobalException";

export class FileNotSupportedException extends CloudServerException {

    constructor(message: string) {
        super(message, 400);
    }

}

