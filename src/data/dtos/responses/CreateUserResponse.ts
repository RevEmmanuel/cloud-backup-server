import { Expose } from "class-transformer";

class CreateUserResponse {

    @Expose()
    'id': number

    @Expose()
    'email': string;

    @Expose()
    'fullName': string;

    @Expose()
    'isVerified': boolean;

}


export default CreateUserResponse;
