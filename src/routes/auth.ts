import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../entities/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {myDataSource} from "../database";
import {VerificationOtp} from "../entities/VerificationOtp";


dotenv.config();
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    console.error('JWT secret key is missing in the .env file');
    throw new Error('JWT secret key is missing in the .env file');
}

const authRouter = Router();
const transporter = require('../config/emailConfig');
const otpGenerator = require('otp-generator');

async function storeOTPInDatabase(ownerEmail: string, otp: any) {
    const otpRepository = myDataSource.getRepository(VerificationOtp);
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

authRouter.post('/signup', async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Missing Email field' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Missing Password field' });
    }
    if (!fullName) {
        return res.status(400).json({ message: 'Missing Full name field' });
    }

    const userRepository = myDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (user) {
        return res.status(401).json({ message: "Email already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isVerified = false;

    const newUser = userRepository.create({
        email,
        password: hashedPassword,
        fullName,
        isVerified,
    });

    await userRepository.save(newUser);

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
        <a href="http://localhost:5000/verify/${otp}" target="_blank">Verify my account</a>
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

    res.status(201).json({ message: 'User registered successfully' });
});

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Missing Email field' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Missing Password field' });
    }

    const userRepository = myDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: `User with email ${email} not found!` });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Incorrect password!' });
    }

    if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your account!' });
    }

    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '24h' });
    res.json({ token });
});

export default authRouter;
