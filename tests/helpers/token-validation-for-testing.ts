import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const SECRET = process.env.TOKEN_SECRET as string;

export const validateTokenTester = (token: string) => {
    return jwt.verify(token, SECRET);
};