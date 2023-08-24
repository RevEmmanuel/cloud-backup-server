import {IsEmail, IsNotEmpty, IsString, IsBoolean, Length} from 'class-validator';

class SignupRequest {

    @IsEmail({}, { message: 'Invalid email format / Email is required' })
    'email': string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password not valid' })
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    'password': string;

    @IsNotEmpty({ message: 'Full name is required' })
    @IsString({ message: 'Full name is required' })
    'fullName': string;

    @IsBoolean({ message: 'Please provide boolean value for user type' })
    'isAdmin': boolean;

}

export default SignupRequest;
