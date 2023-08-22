import express from 'express';
import authRouter from "./routes/auth";
import "reflect-metadata"
import verificationRouter from "./routes/verification";
import filesRouter from "./routes/files";
import downloadRouter from "./routes/downloads";

const app = express();
app.use(express.json());
const authVerification = require("./config/authMiddleware");

app.get('/', (req, res) => {
    res.send('Hello, TypeScript and Express!');
});

app.use('/auth', authRouter);
app.use('/verify', verificationRouter);
app.use('/file', authVerification, filesRouter);
app.use('/download', downloadRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
