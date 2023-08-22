import express from 'express';
import authRouter from "./routes/auth";
import "reflect-metadata"
import verificationRouter from "./routes/verification";
import filesRouter from "./routes/files";
import downloadRouter from "./routes/downloads";
import folderRouter from "./routes/folder";
import adminRouter from "./routes/admin";

const app = express();
app.use(express.json());
const authVerification = require("./config/authMiddleware");
const adminVerification = require("./config/authMiddleware");

app.get('/', (req, res) => {
    res.send('Hello, TypeScript and Express!');
});
app.post('/admin/register/:adminOtp', adminRouter);

app.use('/auth', authRouter);
app.use('/auth/user', authVerification, authRouter);
app.use('/verify', verificationRouter);
app.use('/file', authVerification, filesRouter);
app.use('/folders', authVerification, folderRouter);
app.use('/download', authVerification, downloadRouter);
app.use('/admin', adminVerification, adminRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
