import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { Session } from "../data/entities/Session";
import {myDataSource} from "../database";
import {UnauthorizedException} from "../exceptions/UnauthorizedException";
import {InvalidOtpException} from "../exceptions/InvalidOtpException";
import {globalExceptionHandler} from "../exceptions/GlobalExceptionHandler";
import {CloudServerException} from "../exceptions/GlobalException";


dotenv.config();
const secretKey = process.env.JWT_SECRET || '';


export const authVerification = async (req: any, res: Response, next: NextFunction) => {
    const token = extractTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ message: 'Authorization token required' });
    }

    try {
        const sessionRepository: Repository<Session> = myDataSource.getRepository(Session);
        const foundToken = await sessionRepository.findOne({ where: { jwtToken: token }});
        if (foundToken === null) {
            throw new UnauthorizedException('Please login to continue');
        }
        jwt.verify(token, secretKey, (error: any, decoded: any) => {
            if (error) {
                throw new InvalidOtpException('Invalid or expired token');
            }
            req.user = decoded;
            next();
        });
    } catch (error: any) {
        await globalExceptionHandler(error, req, res, next);
    }
}


export const adminVerification = async (req: any, res: Response, next: NextFunction) => {
    const token = extractTokenFromRequest(req);
    if (!token) {
        res.status(401).json({ message: 'Authorization token required' });
        return;
    }
    try {
        const sessionRepository: Repository<Session> = myDataSource.getRepository(Session);
        const foundToken = await sessionRepository.findOne({ where: { jwtToken: token }});
        if (foundToken === null) {
            throw new UnauthorizedException('Please login to continue');
        }
        jwt.verify(token, secretKey, (error: any, decoded: any) => {
            if (error) {
                throw new InvalidOtpException('Invalid or expired token');
            }
            req.user = decoded;
        });
        const user = req.user.user;
        if (user.role === 'ADMIN') {
            next();
        } else {
            throw new UnauthorizedException('Permission denied');
        }
    }
    catch (error: any) {
        await globalExceptionHandler(error, req, res, next);
    }
};


function extractTokenFromRequest(req: Request) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}


export default {
    authVerification,
    adminVerification,
};
