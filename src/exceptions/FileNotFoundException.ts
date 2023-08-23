import {CloudServerException} from "./GlobalException";

export class FileNotFoundException extends CloudServerException {

    constructor(message: string) {
        super(message, 404);
    }

}

