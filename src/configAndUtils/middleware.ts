import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {myDataSource} from "../database";
import {Session} from "../data/entities/Session";

dotenv.config();
const secretKey = process.env.JWT_SECRET || '';

export const authVerification = async (req: any, res: any, next: any) => {
    const token = extractTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ message: 'Authorization token required' });
    }

    const sessionRepository = myDataSource.getRepository(Session);
    const foundToken = await sessionRepository.findOne({ where: { jwtToken: token }});
    if (foundToken === null) {
        return res.status(401).json({ message: 'Invalid or expired token!' });
    }
    jwt.verify(token, secretKey, (error: any, decoded: any) => {
        if (error) {
            return res.status(401).json({ message: 'Invalid or expired token!' });
        }
        req.user = decoded
        next();
    });
}


export const adminVerification = async (req: any, res: any, next: any) => {
    await authVerification(req, res, next);
    const user = req.user;
    if (user && user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ message: 'Permission denied' });
    }
};


function extractTokenFromRequest(req: any) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

module.exports = {
    authVerification,
    adminVerification,
};
