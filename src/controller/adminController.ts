import {myDataSource} from "../database";
import {User} from "../data/entities/User";
import {Router} from "express";
import {File} from "../data/entities/File";
import dotenv from "dotenv";
import {getAllFilesForUser, getFileById} from "../service/fileService";
import {UserNotFoundException} from "../exceptions/UserNotFoundException";
import {FileNotFoundException} from "../exceptions/FileNotFoundException";
import {CloudServerException} from "../exceptions/GlobalException";
import {inviteAdmin, markFileAsUnsafe} from "../service/adminService";


dotenv.config();
const adminRouter = Router();
const transporter = require('../configAndUtils/emailConfig');


adminRouter.post('/invite', async (req, res, next) => {
    const { email } = req.body;
    try{
        await inviteAdmin(email);
        res.status(200).json({ message: 'Admin invited successfully' });
    } catch(error) {
        next(error);
    }
});


adminRouter.put('/file/mark-unsafe/:fileId', async (req: any, res, next) => {
    const { fileId } = req.params;
    const user = req.user.user;

    try {
        await markFileAsUnsafe(fileId, user);
        return res.status(200).json({ message: 'File marked as unsafe' });
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
    const files = await getAllFilesForUser(user);
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
    const user = req.user.user;

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
