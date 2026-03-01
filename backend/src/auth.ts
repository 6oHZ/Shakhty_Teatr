import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

export const generateTokens = async (userId: number) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = uuidv4();

    await prisma.refreshToken.deleteMany({ where: { userId } });
    const tokenData = await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: userId,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    });

    return { accessToken, refreshToken };
}