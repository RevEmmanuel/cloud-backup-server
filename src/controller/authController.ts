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



/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 createdUser:
 *                   $ref: '#/components/schemas/CreateUserResponse'
 *       400:
 *         description: Bad request, validation errors in signup data
 *       500:
 *         description: Internal server error
 */
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
        console.log(error)
        next(error);
    }
});


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request, validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       property:
 *                         type: string
 *                       constraints:
 *                         type: string
 *       401:
 *         description: Unauthorized, incorrect credentials
 *       403:
 *         description: Forbidden, account not verified or disabled
 *       500:
 *         description: Internal server error
 */
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


/**
 * @swagger
 * /auth/verify/{otp}:
 *   get:
 *     summary: Verify user using OTP
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: otp
 *         required: true
 *         schema:
 *           type: string
 *         description: The OTP to verify user's email
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
authRouter.get('/verify/:otp', async (req, res, next) => {
    try {
        const otp = req.params.otp;
        const token = await verifyUser(otp);
        res.status(200).json({ message: 'User verified successfully', token: token });
    } catch (error) {
        next(error);
    }
});



/**
 * @swagger
 * /auth/users/restore:
 *   put:
 *     summary: Restore user account using email
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user to restore
 *     responses:
 *       200:
 *         description: User account restored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/CreateUserResponse' # Update with the correct schema reference
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
authRouter.put('/users/restore', async (req, res, next) => {
    const { email }  = req.query;
    if (!email) {
        return res.status(400).json({message: 'Missing email field'});
    }
    const emailAddress = email as string;
    try {
        const user = await restoreUserEmail(emailAddress);
        const restoredUser = instanceToPlain(user, { excludeExtraneousValues: true }) as CreateUserResponse;
        res.status(200).json({ message: 'User account restored', user: restoredUser });
    } catch (error) {
        next(error);
    }
});


/**
 * @swagger
 * /auth/admin/register:
 *   post:
 *     summary: Register a user as an admin
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token for admin registration
 *     responses:
 *       200:
 *         description: User granted admin privileges
 *       400:
 *         description: Bad request or missing email field
 *       500:
 *         description: Internal server error or missing JWT secret key
 */
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
