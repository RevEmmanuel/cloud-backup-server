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
import {getUserById} from "../service/userService";


dotenv.config();
const adminRouter = Router();
const transporter = require('../configAndUtils/emailConfig');


/**
 * @swagger
 * /admin/invite:
 *   post:
 *     summary: Invite an admin
 *     tags: [Admin]
 *     parameters:
 *       - name: email
 *         in: body
 *         description: Admin email
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *     responses:
 *       200:
 *         description: Admin invited successfully
 *       500:
 *         description: Internal server error
 */
adminRouter.post('/invite', async (req, res, next) => {
    const { email } = req.body;
    try{
        await inviteAdmin(email);
        res.status(200).json({ message: 'Admin invited successfully' });
    } catch(error) {
        next(error);
    }
});


/**
 * @swagger
 * /admin/file/mark-unsafe/{fileId}:
 *   put:
 *     summary: Mark a file as unsafe
 *     tags: [Admin]
 *     parameters:
 *       - name: fileId
 *         in: path
 *         description: ID of the file to mark as unsafe
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: File marked as unsafe successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
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



/**
 * @swagger
 * /admin/users/all:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User' # Update with the correct schema reference
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
adminRouter.get('/users/all', async (req, res) => {
    const users = await myDataSource.manager.find(User);
    res.status(200).json({ users: users });
});


/**
 * @swagger
 * /admin/files/all:
 *   get:
 *     summary: Get a list of all files
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *       500:
 *         description: Internal server error
 */
adminRouter.get('/files/all', async (req, res) => {
    const files = await myDataSource.manager.find(File);
    res.status(200).json({ files: files });
});


/**
 * @swagger
 * /admin/disable-user/{userId}:
 *   put:
 *     summary: Disable a user account
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to be disabled
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User account disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request, invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
adminRouter.put('/disable-user/:userId', async (req: any, res, next) => {

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


/**
 * @swagger
 * /admin/user/{userId}/files:
 *   get:
 *     summary: Get all files owned by a specific user (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user whose files to retrieve
 *         schema:
 *           type: integer
 *           example: 123
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user's files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *       400:
 *         description: Bad request, invalid user ID
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
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



/**
 * @swagger
 * /admin/user/{userId}/send-mail:
 *   post:
 *     summary: Send email to a user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to send the email to
 *         schema:
 *           type: integer
 *       - in: body
 *         name: emailContent
 *         required: true
 *         description: Email subject and content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subject:
 *                   type: string
 *                   description: Email subject
 *                 content:
 *                   type: string
 *                   description: Email content
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email successfully sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request, missing or invalid data
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
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


/**
 * @swagger
 * /admin/file/{fileId}:
 *   get:
 *     summary: Get file by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         description: ID of the file to retrieve
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 file:
 *                   $ref: '#/components/schemas/File' # Update with the correct schema reference
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
adminRouter.get('/file/:fileId', async (req: any, res, next) => {
    const { fileId } = req.params;
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



/**
 * @swagger
 * /admin/user/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to retrieve
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User' # Update with the correct schema reference
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
adminRouter.get('/user/:userId', async (req: any, res, next) => {
    const { userId } = req.params;
    const user = req.user.user;
    try {
        const foundUser = await getUserById(userId, user);

        if (!foundUser) {
            throw new UserNotFoundException('User not found!');
        }
        return res.status(200).json({user: foundUser});
    } catch (error) {
        next(error);
    }
});

export default adminRouter;
