import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';

class SignupRequest {

    @IsEmail()
    'email': string;

    @IsNotEmpty()
    @IsString()
    'password': string;

    @IsNotEmpty()
    @IsString()
    'fullName': string;

    @IsBoolean()
    'isAdmin': boolean;

}

export default SignupRequest;
