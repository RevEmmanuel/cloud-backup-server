import {Router} from "express";
import {myDataSource} from "../database";
import {User} from "../entities/User";
import {VerificationOtp} from "../entities/VerificationOtp";

const verificationRouter = Router();

const transporter = require('../config/emailConfig');


async function verifyOTP(foundOtp: VerificationOtp | null) {
    if (foundOtp === null) {
        return false;
    }
    const currentTimestamp = Date.now();
    return foundOtp.expiresAt.getTime() >= currentTimestamp;
}

verificationRouter.get('/:otp', async (req, res) => {

    const otp = req.params.otp;

    const otpRepository = myDataSource.getRepository(VerificationOtp);
    const foundOtp = await otpRepository.findOne({ where: { otp } });
    if (foundOtp === null) {
        res.status(401).json({ message: 'Invalid or expired OTP.' });
        return;
    }
    if (!await verifyOTP(foundOtp)) {
        console.log("1");
        await otpRepository.delete({ otp: foundOtp?.otp });
        console.log("2");
        res.status(401).json({ message: 'Invalid or expired OTP.' });
        return;
    }
    const email = foundOtp.ownerEmail;

    const userRepository = myDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (user === null) {
        res.status(500).json({ message: 'An error occured' });
        return;
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

    res.status(201).json({ message: 'User verified successfully' });
});

export default verificationRouter;
