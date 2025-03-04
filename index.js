import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dishRoutes from './routes/dishesRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT;

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use('/auth', authRoutes);
// console.log('Routes disponibles:', app._router.stack);
app.use('/', userRoutes);
app.use('/', dishRoutes);
app.use('/', ingredientRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(PORT, () => {
    console.log(`Tourne sur http://localhost:${PORT}`)
});