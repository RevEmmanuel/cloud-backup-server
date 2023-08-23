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


authRouter.post('/signup', async (req, res) => {
    const signupDto = plainToInstance(SignupRequest, req.body);
    const validationErrors = await validate(signupDto, { validationError: { target: false } });
    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }
    const createdUser = await createNewUser(signupDto);
    const createUserResponse = instanceToPlain(createdUser, { excludeExtraneousValues: true }) as CreateUserResponse;
    res.status(201).json({ message: 'User registered successfully', createdUser: createUserResponse });
});


authRouter.post('/login', async (req, res) => {
    const loginDto = plainToInstance(LoginRequest, req.body);
    const validationErrors = await validate(loginDto, { validationError: { target: false } });
    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }
    const token = await loginUser(loginDto);
    res.status(200).json({ token });

});


authRouter.get('/:otp', async (req, res) => {
    const otp = req.params.otp;
    const token = await verifyUser(otp);
    res.status(200).json({ message: 'User verified successfully', token: token });
});


authRouter.put('/users/:email/restore', async (req, res) => {
    const { email } = req.params;
    try {
        const user = await restoreUserEmail(email);
        const restoredUser = instanceToPlain(user, { excludeExtraneousValues: true }) as CreateUserResponse;
        res.status(200).json({ message: 'User account restored', user: restoredUser });
    } catch (error) {
        res.status(500).json({ message: 'Error restoring user account' });
    }
});


authRouter.post('/admin/register', async (req: any, res) => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        console.error('JWT secret key is missing in the .env file');
        throw new CloudServerException('JWT secret key is missing', 500);
    }
    const { token } = req.query;
    const payload = jwt.verify(token, secretKey) as JwtPayload;
    const { email } = payload;
    if (!email) {
        return res.status(400).json({ message: 'Missing Email field' });
    }
    const registrationStatus = await registerAdmin(email);
    if (registrationStatus) {
        return res.status(200).json({ message: 'User granted admin privileges' });
    } else {
        return res.status(500).json({ message: 'An error occurred' });
    }
});


export default authRouter;
