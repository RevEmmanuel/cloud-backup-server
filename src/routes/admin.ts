import {myDataSource} from "../database";
import {User} from "../entities/User";
import bcrypt from "bcrypt";
import {Router} from "express";
import {File} from "../entities/File";


const adminRouter = Router();
const transporter = require('../config/emailConfig');

adminRouter.post('/register', async (req, res) => {
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
    const role = 'ADMIN';

    const newUser = userRepository.create({
        email,
        password: hashedPassword,
        fullName,
        isVerified,
        role,
    });

    await userRepository.save(newUser);

    const mailOptions = {
        from: '"Cloud Backup" <cloud-backup@gmail.com>',
        to: `${email}`,
        subject: 'You have been added as an Admin',
        html: `
        <h1>Hi, ${fullName}!</h1>
        <h1>Welcome to Cloud Backup Admin Block.</h1>
        <p>We're glad to have you on the team!</p>
        `
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });

    res.status(201).json({ message: 'Admin registered successfully' });
});

adminRouter.put('/file/mark-unsafe/:fileId', async (req: any, res) => {
    const { fileId } = req.params;

    try {
        const fileRepository = myDataSource.getRepository(File);
        const file = await fileRepository.findOne(fileId);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        file.isUnsafe = true;
        await fileRepository.save(file);

        res.status(200).json({ message: 'File marked as unsafe' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking file as unsafe' });
    }
});

export default adminRouter;
