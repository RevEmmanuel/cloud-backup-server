import express from 'express';
import authRouter from "./controller/authController";
import "reflect-metadata"
import filesRouter from "./controller/fileController";
import downloadRouter from "./controller/downloads";
import folderRouter from "./controller/folderController";
import adminRouter from "./controller/adminController";
import userRouter from "./controller/userController";
import {adminVerification, authVerification} from "./configAndUtils/middleware";
import {globalExceptionHandler} from "./exceptions/GlobalExceptionHandler";


const app = express();
app.use(express.json());


app.get('/', (req, res) => {
    const introHtmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloud Backup System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        h1 {
            color: #333;
        }
        h2 {
            color: #555;
        }
        p {
            color: #777;
        }
        ul {
            list-style-type: disc;
            padding-left: 20px;
        }
        li {
            margin-bottom: 10px;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .developer {
            margin-top: 40px;
            border-top: 1px solid #ccc;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <h1>Cloud Backup System</h1>
    <p>This is a Node.js (TypeScript and Express) server application that serves as a cloud backup system.</p>
    
    <h2>Features</h2>
    <ul>
        <li>Signup</li>
        <li>Login</li>
        <li>Upload files</li>
        <li>Download files</li>
        <li>Folders for easy file arrangement</li>
    </ul>
    
    <h2>Extras</h2>
    <ul>
        <li>Admin type for content management</li>
        <li>Monitoring of files for safety (Admins can mark pictures and videos as unsafe)</li>
        <li>Unsafe files automatically get deleted</li>
        <li>Revokable Session Management</li>
        <li>Multiple admin reviews before file deletion</li>
    </ul>
    
    <h2>Technologies Used</h2>
    <ul>
        <li>Node.js (TypeScript & Express)</li>
        <li>PostgreSQL</li>
        <li>Cloudinary</li>
        <li>JWT</li>
        <li>Gmail SMTP</li>
    </ul>
    
    <h2>Documentation</h2>
    <p>The API documentation is available through Postman. You can access it using the following link:</p>
    <p><a href="https://bit.ly/cloud-backup-server" target="_blank">Postman Documentation</a></p>
    
    <div class="developer">
        <h2>Developer & Engineer</h2>
        <p>Adeola Adekunle</p>
        <ul>
            <li><a href="https://github.com/RevEmmanuel" target="_blank">GitHub (RevEmmanuel)</a></li>
            <li><a href="https://twitter.com/Adeola_Ade1" target="_blank">Twitter (@Adeola_Ade1)</a></li>
            <li><a href="https://www.instagram.com/deolaaxo/" target="_blank">Instagram (@deolaaxo)</a></li>
            <li><a href="https://www.linkedin.com/in/adeola-adekunle-emmanuel/" target="_blank">LinkedIn (Adeola Adekunle)</a></li>
            <li>Email: <a href="mailto:adeolaae1@gmail.com">adeolaae1@gmail.com</a></li>
        </ul>
    </div>
</body>
</html>
`
    res.send(introHtmlContent);
});


app.use('/auth', authRouter);
app.use('/user', authVerification, userRouter);
app.use('/file', authVerification, filesRouter);
app.use('/folder', authVerification, folderRouter);
app.use('/download', authVerification, downloadRouter);
app.use('/admin', adminVerification, adminRouter);


app.use(globalExceptionHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

