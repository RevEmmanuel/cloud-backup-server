import {myDataSource} from "../database";
import {User} from "../data/entities/User";
import bcrypt from "bcrypt";
import {UserNotFoundException} from "../exceptions/UserNotFoundException";
import {UnauthorizedException} from "../exceptions/UnauthorizedException";
import {IncorrectPasswordException} from "../exceptions/IncorrectPasswordException";
import {Session} from "../data/entities/Session";


const transporter = require('../configAndUtils/emailConfig');


export async function deleteUser(id: number, password: string, userMakingRequest: User) {
    const userRepository = myDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: id });
    if (!user) {
        throw new UserNotFoundException('User not found!');
    }
    console.log(userMakingRequest as User);
    if (user !== userMakingRequest as User) {
        console.log(user);
        console.log(userMakingRequest as User);
        if (userMakingRequest.role !== 'ADMIN') {
            console.log(user.role);
            console.log(userMakingRequest.role);
            throw new UnauthorizedException('You are not authorized to perform this action!');
        }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new IncorrectPasswordException('Incorrect Password!');
    }

    user.isDeleted = true;
    await userRepository.save(user);

    const mailOptions = {
        from: '"Cloud Backup" <cloud-backup@gmail.com>',
        to: `${user.email}`,
        subject: 'We\'re sorry to see you go ):',
        html: `
        <h1>Hi, ${user.fullName}!</h1>
        <h1>Leaving so soon?</h1>
        <p>Although we had many memories together, we're sad to hear you're leaving ):</p>
        <p>We wish you best of luck in your future storage needs!</p>
        
        
        <br />
        <br />
        <p>Please click the link below to restore your account:</p>
        <a href="http://localhost:5000/auth/users/${user.email}/restore" target="_blank">Restore my account</a>
        <p>If that doesn't work, copy the link below and paste in your browser:</p>
        <p>http://localhost:5000/auth/users/${user.email}/restore</p>
        <p>Valid for 30 days</p>
        `
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

export async function revokeUserSessions(user: User) {
    const sessionRepository = myDataSource.getRepository(Session);
    const tokens = await sessionRepository.find({ where: { user: user } });
    try {
        for (const token of tokens) {
            await sessionRepository.remove(token);
        }
    } catch (e) {
        return false;
    }
    return true;
}


export async function getAllUsers() {
    return await myDataSource.manager.find(User);
}
