import {Router} from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import { validate } from "class-validator";
import {instanceToPlain, plainToInstance} from 'class-transformer';
import SignupRequest from "../data/dtos/requests/SignUpRequest";
import {createNewUser, loginUser, registerAdmin, restoreUserEmail, verifyUser} from "../service/authService";
import LoginRequest from "../data/dtos/requests/LoginRequest";
import dotenv from "dotenv";
import {CloudServerException} from "../exceptions/GlobalException";
import CreateUserResponse from "../data/dtos/responses/CreateUserResponse";


dotenv.config();
const authRouter = Router();


const validationOptions = {
    validationError: { target: false },
    each: true,
    message: {
        isNotEmpty: 'This field should not be empty',
        isEmail: 'Invalid email format',
        length: 'Password must be between $constraint1 and $constraint2 characters',
    },
};


authRouter.post('/signup', async (req, res, next) => {
    try {
        const signupDto = plainToInstance(SignupRequest, req.body);
        const validationErrors = await validate(signupDto, validationOptions);
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }
        const createdUser = await createNewUser(signupDto);
        const createUserResponse = instanceToPlain(createdUser, { excludeExtraneousValues: true }) as CreateUserResponse;
        res.status(201).json({ message: 'User registered successfully', createdUser: createUserResponse });
    } catch (error) {
        next(error);
    }
});


authRouter.post('/login', async (req, res, next) => {
    const loginDto = plainToInstance(LoginRequest, req.body);
    const validationErrors = await validate(loginDto, validationOptions);
    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }
    try {
        const token = await loginUser(loginDto);
        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
});


authRouter.get('/verify/:otp', async (req, res, next) => {
    try {
        const otp = req.params.otp;
        const token = await verifyUser(otp);
        res.status(200).json({ message: 'User verified successfully', token: token });
    } catch (error) {
        next(error);
    }
});


authRouter.put('/users/:email/restore', async (req, res, next) => {
    const { email } = req.params;
    try {
        const user = await restoreUserEmail(email);
        const restoredUser = instanceToPlain(user, { excludeExtraneousValues: true }) as CreateUserResponse;
        res.status(200).json({ message: 'User account restored', user: restoredUser });
    } catch (error) {
        next(error);
    }
});


authRouter.post('/admin/register', async (req: any, res, next) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        console.error('JWT secret key is missing in the .env file');
        throw new CloudServerException('JWT secret key is missing', 500);
    }
    const { token } = req.query;
    try{
        const payload = jwt.verify(token, secretKey) as JwtPayload;
        const { email } = payload;
        if (!email) {
            return res.status(400).json({ message: 'Missing Email field' });
        }
        await registerAdmin(email);
        return res.status(200).json({ message: 'User granted admin privileges' });
    }
    catch (error) {
        next(error);
    }
});


export default authRouter;
