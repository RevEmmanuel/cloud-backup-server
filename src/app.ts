import express from 'express';
import authRouter from "./controller/authController";
import "reflect-metadata"
import filesRouter from "./controller/fileController";
import downloadRouter from "./controller/downloads";
import folderRouter from "./controller/folderController";
import adminRouter from "./controller/adminController";
import userRouter from "./controller/userController";
import {CloudServerException} from "./exceptions/GlobalException";
import {adminVerification, authVerification} from "./configAndUtils/middleware";

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, TypeScript and Express!');
});


app.use('/auth', authRouter);
app.use('/user', authVerification, userRouter);
app.use('/file', authVerification, filesRouter);
app.use('/folder', authVerification, folderRouter);
app.use('/download', authVerification, downloadRouter);
app.use('/admin', adminVerification, adminRouter);


app.use((err: CloudServerException, req: any, res: any, next: any) => {
    console.error('Error ' + err.statusCode + ':  ' + err.message);
    console.error(err.stack);
    res.status(err.statusCode || 500).json({ message: err.message });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
