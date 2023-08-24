import {CloudServerException} from "../exceptions/GlobalException";
import {myDataSource} from "../database";
import {User} from "../data/entities/User";
import {UserNotFoundException} from "../exceptions/UserNotFoundException";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {Router} from "express";
import {File} from "../data/entities/File";
import {getFileById} from "./fileService";
import {FileNotFoundException} from "../exceptions/FileNotFoundException";

dotenv.config();
const adminRouter = Router();
const transporter = require('../configAndUtils/emailConfig');
const secretKey = process.env.JWT_SECRET || '';

export async function inviteAdmin(email: string) {
    if (!email) {
        throw new CloudServerException('Missing email field', 500);
    }

    const userRepository = myDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: email } });
    console.log(user);
    if (!user) {
        throw new UserNotFoundException('Account does not exist');
    }
    if (user.role === 'ADMIN') {
        throw new CloudServerException('User is already an admin', 500);
    }

    const token = jwt.sign({ email }, secretKey, { expiresIn: '24h' });
    const invitationLink = `http://localhost:5000/admin/register?token=${token}`;

    const mailOptions = {
        from: '"Cloud Backup Admin" <cloud-backup@gmail.com>',
        to: `${email}`,
        subject: 'You have been invited to become an Admin',
        html: `
        <h1>Hi!</h1>
        <h1>Welcome to Cloud Backup Admin Block.</h1>
        <p>We're glad to have you on the team!</p>
        <p>Please click the link below to accept invitation!</p>
        
        <a href=${invitationLink} target="_blank">Accept invitation</a>
        <br />
        <p>If that doesn't work, copy and paste the link below in your browser.</p>
        <p>${invitationLink}</p>
        <p>Link is only valid for 24 hours.</p>
        `
    };

    await transporter.sendMail(mailOptions, async (error: any, info: any) => {
        if (error) {
            console.error('Error sending email:', error);
            throw new CloudServerException(error.message, 500);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}


export async function markFileAsUnsafe(fileId: number, user: User) {
    const fileRepository = myDataSource.getRepository(File);
    const file = await getFileById(fileId, user);
    if (!file) {
        throw new FileNotFoundException('File not found');
    }
    file.isUnsafe = true;
    file.unsafeCount = file.unsafeCount + 1;
    if (file.unsafeCount < 3) {
        await fileRepository.save(file);
        const mailOptions = {
            from: '"Cloud Backup Admin" <cloud-backup@gmail.com>',
            to: `${file.user.email}`,
            subject: 'Your file has been flagged as unsafe!',
            html: `
        <h1>Hi, ${file.user.fullName}!</h1>
        <h1>Your file ${file.originalFileName} which you uploaded on ${file.dateUploaded.getDate()} has been flagged as unsafe and is likely to be deleted soon..</h1>
        <p>Regards, Cloud Backup!</p>
        `
        };

        transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) {
                console.error('Error sending email:', error);
                throw new CloudServerException(error.message, 500);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    } else {
        const mailOptions = {
            from: '"Cloud Backup Admin" <cloud-backup@gmail.com>',
            to: `${file.user.email}`,
            subject: 'Your file has been flagged as unsafe!',
            html: `
        <h1>Hi, ${file.user.fullName}!</h1>
        <h1>Your file ${file.originalFileName} which was previously marked as unsafe has been deleted.</h1>
        <p>Regards, Cloud Backup!</p>
        `
        };
        transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) {
                console.error('Error sending email:', error);
                throw new CloudServerException(error.message, 500);
            } else {
                console.log('Email sent:', info.response);
            }
        });
        await fileRepository.delete(file);
    }
}