import {Expose} from "class-transformer";

export class FindFileResponse {

    @Expose()
    'id': number

    @Expose()
    'slug': string;

    @Expose()
    'fileUrl': string;

    @Expose()
    'originalFileName': string;

    @Expose()
    'dateUploaded': Date;

    @Expose()
    'fileType': string;

    @Expose()
    'isUnsafe': boolean;

}
