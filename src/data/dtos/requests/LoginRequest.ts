import {IsEmail, IsNotEmpty, IsString, Length} from 'class-validator';

class LoginRequest {

    @IsEmail({}, { message: 'Invalid email format / Email is required' })
    'email': string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password not valid' })
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    'password': string;

}

export default LoginRequest;
