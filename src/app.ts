import express from 'express';
import authRouter from "./routes/auth";
import "reflect-metadata"
import verificationRouter from "./routes/verification";
import uploadRouter from "./routes/files";

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, TypeScript and Express!');
});

app.use('/auth', authRouter);
app.use('/verify', verificationRouter);
app.use('/file', uploadRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
