import {Expose} from "class-transformer";

class CreateFolderResponse {

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


export default CreateFolderResponse;
