import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();
const secretKey = process.env.JWT_SECRET || '';

const authVerification = (req: any, res: any, next: any) => {
    const token = extractTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ message: 'Authorization token required' });
    }

    jwt.verify(token, secretKey, (error: any, decoded: any) => {
        if (error) {
            return res.status(401).json({ message: 'Invalid or expired token!' });
        }
        req.user = decoded
        next();
    })
}

module.exports = authVerification;
function extractTokenFromRequest(req: any) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

