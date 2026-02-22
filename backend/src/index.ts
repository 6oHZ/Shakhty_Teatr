import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './middleware'

const app = express();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

app.use(express.json());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/login', async (req, res) => {
    const {login, password} = req.body;

    if (login === 'admin' && password === '13368005') {
        const token = jwt.sign({ user: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }

    res.status(401).json({ error: 'Неверный логин или пароль' });
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