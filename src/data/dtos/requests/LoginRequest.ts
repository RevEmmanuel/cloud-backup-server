import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

class LoginRequest {

    @IsEmail()
    'email': string;

    @IsNotEmpty()
    @IsString()
    'password': string;

}

export default LoginRequest;
