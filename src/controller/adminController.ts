import {myDataSource} from "../database";
import {User} from "../data/entities/User";
import {Router} from "express";
import {File} from "../data/entities/File";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import {getFileById} from "../service/fileService";
import {UserNotFoundException} from "../exceptions/UserNotFoundException";
import {FileNotFoundException} from "../exceptions/FileNotFoundException";
import {CloudServerException} from "../exceptions/GlobalException";


dotenv.config();
const adminRouter = Router();
const transporter = require('../configAndUtils/emailConfig');
const secretKey = process.env.JWT_SECRET || '';


adminRouter.post('/invite', async (req, res, next) => {
    const { email } = req.body;
    console.log(email);
    try{
        if (!email) {
            throw new CloudServerException('Missing email field', 500);
        }

        const userRepository = myDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email: email } });
        console.log(user);
        if (!user) {
            throw new UserNotFoundException('User not found!');
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
        res.status(200).json({ message: 'Admin invited successfully' });
    } catch(error) {
        next(error);
    }
});


adminRouter.put('/file/mark-unsafe/:fileId', async (req: any, res, next) => {
    const { fileId } = req.params;
    const user = req.user;

    try {
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
            return res.status(200).json({ message: 'File marked as unsafe' });
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
            return res.status(200).json({ message: 'File marked as unsafe by multiple admins; File deleted!' });
        }
    } catch (error) {
        next(error);
    }
});

adminRouter.get('/users/all', async (req, res) => {
    const users = await myDataSource.manager.find(User);
    res.status(200).json({ users: users });
});


adminRouter.get('/files/all', async (req, res) => {
    const files = await myDataSource.manager.find(File);
    res.status(200).json({ files: files });
});


adminRouter.put('/user/:userId', async (req: any, res, next) => {

    const userId = req.params.userId;
    const userRepository = myDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
        next(new UserNotFoundException('User not found!'));
        return;
    }
    user.isDisabled = true;
    await userRepository.save(user);

    const mailOptions = {
        from: '"Cloud Backup Admin" <cloud-backup@gmail.com>',
        to: `${user.email}`,
        subject: 'Your account has been disabled',
        html: `
        <h1>Hi, ${user.fullName}!</h1>
        <h1>Your acount ${user.email} has been temporarily disabled.</h1>
        <p>Regards, Cloud Backup!</p>
        `
    };
    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.error('Error sending email:', error);
            throw new CloudServerException(error.message, 500);
        } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'User account disabled' });
        }
    });
});


adminRouter.get('/user/:userId/files', async (req: any, res, next) => {
    const userId = req.params.userId;
    const userRepository = myDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
        next(new UserNotFoundException('User not found!'));
        return;
    }

    const fileRepository = myDataSource.getRepository(File);
    const files = await fileRepository.findBy({ user: user });
    res.status(200).json({ files: files });
});


adminRouter.post('/user/:userId/send-mail', async (req: any, res, next) => {
    const userId = req.params.userId;
    const { subject, content } = req.body;
    const userRepository = myDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
        next(new UserNotFoundException('User not found!'));
        return;
    }

    const mailOptions = {
        from: '"Cloud Backup Admin" <cloud-backup@gmail.com>',
        to: `${user.email}`,
        subject: subject,
        text: content,
    };
    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.error('Error sending email:', error);
            throw new CloudServerException(error.message, 500);
        } else {
            console.log('Email sent:', info.response);
        }
    });
    res.status(200).json({ message: 'Email Sent!' });
});


adminRouter.get('/file/:fileId', async (req: any, res, next) => {
    const { fileId } = req.params.fileId;
    const user = req.user;

    try {
        const file = await getFileById(fileId, user);

        if (!file) {
            throw new FileNotFoundException('File not found!');
        }
        return res.status(200).json({file: file});
    } catch (error) {
        next(error);
    }
});



export default adminRouter;
