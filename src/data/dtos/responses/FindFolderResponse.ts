import {Expose} from "class-transformer";

export class FindFolderResponse {

    @Expose()
    'id': number;

    @Expose()
    'name': string;

    @Expose()
    'slug': string;

    @Expose()
    'dateUploaded': Date;

    @Expose()
    'lastEditedOn': Date;

}