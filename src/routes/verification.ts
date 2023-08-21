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
    if (!await verifyOTP(foundOtp)) {
        await otpRepository.delete({ otp: foundOtp?.otp });
        res.send('Invalid or expired OTP.');
    }
    const email = foundOtp?.ownerEmail;

    const userRepository = myDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    // @ts-ignore
    user.isVerified = true;
    // @ts-ignore
    await userRepository.save(user);
    // @ts-ignore
    await otpRepository.delete({ otp: foundOtp.otp });
    // @ts-ignore
    const fullName = user.fullName;


    const mailOptions = {
        from: '"Cloud Backup" <cloud-backup@gmail.com>',
        to: `${email}`,
        subject: 'Email Verified',
        html: `
        <h1>Hi, ${fullName}!</h1>
        <h1>Your account has been successfully verified</h1>
        <p>Enjoy your amazing features!</p>
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
