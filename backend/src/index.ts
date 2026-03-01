import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './middleware'
import { prisma } from './prisma'
import { generateTokens } from "./auth";
import cookieParser from 'cookie-parser';


const app = express();

const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

app.use(express.json());
app.use(cookieParser());



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.post('/login', async (req, res) => {
    const {login, password} = req.body;

    if (login === 'admin' && password === '13368005') {
        const userId = 1;
        const { accessToken, refreshToken } = await generateTokens(userId);

        res.cookie('accessToken', accessToken, {
            maxAge: 15 * 60 * 1000,
            secure: false,
            sameSite: 'strict'
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: 'strict'

        });

        return res.json({ accessToken });
    }

    res.status(401).json({ error: 'Пошел нахуй' });

    res.status(401).json({ error: 'Неверный логин или пароль' });
})

app.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    const savedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
    });

    if (!savedToken || savedToken.expiresAt < new Date()) {
        return res.status(403).json({ error: 'Refresh token expired or invalid' });
    }


    const tokens = await generateTokens(savedToken.userId);

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    });

    return res.json({ message: 'Logged in successfully' });
})

app.get('/plays', authenticateToken , async (req, res) => {
    try {
        const plays = await prisma.play.findMany();
        res.json(plays);
    } catch (error) {
        res.status(500).json({ error: `Ошибка при получении данных`, code: error.code, message: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server ready at: http://localhost:${port}`);
    console.log(`Documentation: http://localhost:${port}/api-docs`);
});