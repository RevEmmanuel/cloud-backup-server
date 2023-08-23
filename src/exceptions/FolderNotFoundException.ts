import {CloudServerException} from "./GlobalException";

export class FolderNotFoundException extends CloudServerException {

    constructor(message: string) {
        super(message, 404);
    }

}

