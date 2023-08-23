import {CloudServerException} from "./GlobalException";

export class UploadException extends CloudServerException {

    constructor(message: string) {
        super(message, 500);
    }

}

