import SignUpRequest from "../data/dtos/requests/SignUpRequest";
import {myDataSource} from "../database";
import {User} from "../data/entities/User";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import {VerificationOtp} from "../data/entities/VerificationOtp";
import {EmailAlreadyExistsException} from "../exceptions/EmailAlreadyExists";
import LoginRequest from "../data/dtos/requests/LoginRequest";
import {UserNotFoundException} from "../exceptions/UserNotFoundException";
import {IncorrectPasswordException} from "../exceptions/IncorrectPasswordException";
import {AccountNotVerifiedException} from "../exceptions/AccountNotVerifiedException";
import dotenv from "dotenv";
import {Session} from "../data/entities/Session";
import {CloudServerException} from "../exceptions/GlobalException";
import {AccountDisabledException} from "../exceptions/AccountDisabledException";
import {InvalidOtpException} from "../exceptions/InvalidOtpException";
import {UnauthorizedException} from "../exceptions/UnauthorizedException";


dotenv.config();
const userRepository = myDataSource.getRepository(User);
const otpRepository = myDataSource.getRepository(VerificationOtp);
const otpGenerator = require('otp-generator');
const transporter = require('../configAndUtils/emailConfig');


export async function createNewUser(dto: SignUpRequest) {
    const email = dto.email;
    const fullName = dto.fullName;

    const user = await userRepository.findOne({ where: { email } });
    if (user) {
        throw new EmailAlreadyExistsException('This email is already registered!');
    }

    const newUser = await createUserFromDto(dto);

    const createdUser = await userRepository.save(newUser);

    const otp = await otpGenerator.generate(12, { upperCase: false, specialChars: false });
    console.log('Generated OTP:', otp);
    await storeOTPInDatabase(email, otp);

    const mailOptions = {
        from: '"Cloud Backup" <cloud-backup@gmail.com>',
        to: `${email}`,
        subject: 'Welcome to Cloud Backup',
        html: `
        <h1>Hi, ${fullName}!</h1>
        <h1>Welcome to Cloud Backup</h1>
        <p>Your one-stop solution to storage needs</p>
        <p>We're glad to have you!</p>
        
        <p>Please click the link below to verify your account:</p>
        <a href="http://localhost:5000/auth/verify/${otp}" target="_blank">Verify my account</a>
        <br />
        <br />
        <p>If that doesn't work, copy the link below and paste in your browser:</p>
        <p>http://localhost:5000/verify/${otp}</p>
        `
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });

    return createdUser;
}


export async function loginUser(dto: LoginRequest) {
    const email = dto.email;
    const password = dto.password;

    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
        throw new UserNotFoundException('User not found!');
    }

    if (user.isDeleted) {
        throw new UserNotFoundException('User not found!');
    }

    if (!user.isVerified) {
        throw new AccountNotVerifiedException('Please verify your account!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new IncorrectPasswordException('Incorrect Password!');
    }

    if (user.isDisabled) {
        throw new AccountDisabledException('Account disabled!')
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        console.error('JWT secret key is missing in the .env file');
        throw new CloudServerException('JWT secret key is missing', 500);
    }
    const token = jwt.sign({ user: user }, secretKey, { expiresIn: '24h' });

    const sessionRepository = myDataSource.getRepository(Session);
    const newSession = sessionRepository.create({
        user,
        jwtToken: token,
    });
    await sessionRepository.save(newSession);
    return token;
}

export async function restoreUserEmail(email: string) {
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
        throw new UserNotFoundException('User not found!');
    }
    if (!user.isDeleted) {
        throw new UnauthorizedException('User account was not deleted');
    }
    user.isDeleted = false;
    return await userRepository.save(user);
}

export async function registerAdmin(email: string) {
    const user = await userRepository.findOneBy( { email });
    if (!user) {
        throw new UserNotFoundException('User not registered!');
    }
    if (user.isDisabled) {
        throw new AccountDisabledException('Account disabled!')
    }
    if (user.role === 'ADMIN') {
        throw new CloudServerException('User is already an admin', 400);
    }
    user.role = 'ADMIN';
    await userRepository.save(user);
}


export async function verifyUser(otp: string) {
    const foundOtp = await otpRepository.findOne({ where: { otp } });
    if (foundOtp === null) {
        throw new InvalidOtpException('Invalid or expired OTP.');
    }
    if (!await verifyOTP(foundOtp)) {
        await otpRepository.delete({ otp: foundOtp.otp });
        throw new InvalidOtpException('Invalid or expired OTP.');
    }

    const email = foundOtp.ownerEmail;
    const user = await userRepository.findOne({ where: { email } });
    if (user === null) {
        throw new UserNotFoundException('User not registered!');
    }
    user.isVerified = true;
    await userRepository.save(user);
    await otpRepository.delete({ otp: foundOtp.otp });
    const fullName = user.fullName;

    const mailOptions = {
        from: '"Cloud Backup" <cloud-backup@gmail.com>',
        to: `${email}`,
        subject: 'Email Verified',
        html: `
        <h1>Hi, ${fullName}!</h1>
        <h1>Your account has been successfully verified</h1>
        <p>Enjoy our amazing features!</p>
        <p>Again, We're glad to have you!</p>
        `
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        console.error('JWT secret key is missing in the .env file');
        throw new CloudServerException('An error occurred', 500);
    }
    const token = jwt.sign({user: user}, secretKey, {expiresIn: '24h'});
    const sessionRepository = myDataSource.getRepository(Session);
    const newSession = sessionRepository.create({
        user,
        jwtToken: token,
    });
    await sessionRepository.save(newSession);
    return token;
}


async function createUserFromDto(dto: SignUpRequest) {
    const email = dto.email;
    const password = dto.password;
    const fullName = dto.fullName;
    const isAdmin = dto.isAdmin;
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = isAdmin ? 'ADMIN' : 'USER';
    const currentTime = new Date();
    const dateJoined = new Date(currentTime);
    dateJoined.setDate(currentTime.getDate());

    return userRepository.create({
        email,
        password: hashedPassword,
        fullName,
        role,
        dateJoined,
    });
}


async function storeOTPInDatabase(ownerEmail: string, otp: string) {
    const currentTime = new Date();
    const expiresAt = new Date(currentTime);
    expiresAt.setHours(currentTime.getHours() + 24)

    const newOtp = otpRepository.create({
        ownerEmail,
        otp,
        expiresAt,
    });
    await otpRepository.save(newOtp);
}


async function verifyOTP(foundOtp: VerificationOtp | null) {
    if (foundOtp === null) {
        return false;
    }
    const currentTimestamp = Date.now();
    return foundOtp.expiresAt.getTime() >= currentTimestamp;
}
