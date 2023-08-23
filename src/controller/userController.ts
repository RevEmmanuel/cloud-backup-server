import {Router} from "express";
import {deleteUser, revokeUserSessions} from "../service/userService";


const userRouter = Router();


userRouter.delete('/delete/:userId', async (req: any, res) => {
    const { userId } = req.params;
    const { password } = req.body;
    const userMakingRequest = req.user;
    const id = userId;

    if (!id) {
        return res.status(400).json({ message: 'Missing field userId' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Missing Password field' });
    }
    if (userMakingRequest.id !== id && userMakingRequest.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Method Not Allowed!' });
    }

    await deleteUser(id, password, userMakingRequest);
    res.status(200).json({ message: `User account has been deleted!` });
});


userRouter.post('/revoke-sessions', async (req: any, res) => {
    const user = req.user;
    const success = await revokeUserSessions(user);
    if (success) {
        res.status(200).json({ message: 'Sessions revoked' });
    } else {
        res.status(500).json({ message: 'Error while revoking user sessions' });
    }
});


export default userRouter;