import {Router} from "express";
import {deleteUser, getUserById, revokeUserSessions} from "../service/userService";
import {UnauthorizedException} from "../exceptions/UnauthorizedException";
import {instanceToPlain} from "class-transformer";
import CreateUserResponse from "../data/dtos/responses/CreateUserResponse";
import {UserNotFoundException} from "../exceptions/UserNotFoundException";


const userRouter = Router();


userRouter.delete('/delete/:userId', async (req: any, res, next) => {
    const { userId } = req.params;
    const { password } = req.body;
    const userMakingRequest = req.user;

    try {
        if (!userId) {
            return res.status(400).json({ message: 'Missing field userId' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Missing Password field' });
        }
        const numberUserId = parseInt(userId);
        if (userMakingRequest.user.id !== numberUserId) {
            if (userMakingRequest.user.role !== 'ADMIN') {
                throw new UnauthorizedException('Method not allowed');
            }
        }
        await deleteUser(numberUserId, password, userMakingRequest.user);
        return res.status(200).json({ message: `User account has been deleted!` });
    }
    catch(error) {
        next(error);
    }
});


userRouter.post('/revoke-sessions', async (req: any, res, next) => {
    const user = req.user.user;
    try {
        await revokeUserSessions(user);
        res.status(200).json({ message: 'Sessions revoked' });
    }
    catch (error) {
        next(error);
    }
});


userRouter.get('/', async (req: any, res, next) => {
    try {
        const user = req.user.user;
        const foundUser = await getUserById(user.id, user);
        if (!foundUser) {
            throw new UserNotFoundException('An error occurred / User not found');
        }
        const restoredUser = instanceToPlain(foundUser, { excludeExtraneousValues: true }) as CreateUserResponse;
        res.status(200).json({ user: restoredUser });
    }
    catch (error) {
        next(error);
    }
});


export default userRouter;