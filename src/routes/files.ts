import {Router} from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinaryConfig';
import {myDataSource} from "../database";
import {File} from "../entities/File";
import { Folder } from '../entities/Folder';
import fs from 'fs';
import path from 'path';


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const slugGenerator = require('otp-generator');
const filesRouter = Router();


filesRouter.get('/', async (req: any, res) => {
    try {
        const userId = req.user.userId;

        const fileRepository = myDataSource.getRepository(File);
        const files = await fileRepository.find({ where: { user: userId } });

        res.status(200).json({ files: files });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching files' });
    }
});


filesRouter.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { originalname, buffer, mimetype } = req.file;

        let result;

        const bufferNew = path.join(originalname);
        fs.writeFileSync(bufferNew, buffer);

        if (mimetype.startsWith('image') || mimetype.startsWith('video') || mimetype.startsWith('audio')) {
            if (buffer.length <= 90 * 1024 * 1024) {
                result = await cloudinary.uploader.upload(bufferNew);
            } else {
                result = await cloudinary.uploader.upload_large(bufferNew, { resource_type: 'auto' });
            }
        } else if (mimetype === 'application/pdf' || mimetype === 'application/msword' || mimetype === 'application/zip' || mimetype === 'text/plain' || mimetype === 'text/csv') {
            result = await cloudinary.uploader.upload(bufferNew, {
                resource_type: 'raw',
                folder: 'documents/',
            });
        } else {
            res.status(400).json({ message: 'File type not supported!' });
        }

        if (!result) {
            return res.status(500).json({ message: 'File upload failed' });
        }

        fs.unlinkSync(bufferNew);

        const fileRepository = myDataSource.getRepository(File);
        const slug = await slugGenerator.generate(6, { upperCase: false, specialChars: false });
        const currentTime = new Date();
        const dateUploaded = new Date(currentTime);
        dateUploaded.setDate(currentTime.getDate());
        const newFile = fileRepository.create({
            slug,
            originalFileName: originalname,
            dateUploaded,
            fileType: mimetype,
            fileUrl: result.secure_url,
        });

        const savedFile = await fileRepository.save(newFile);

        res.status(200).json({ message: 'SUCCESSFUL', file: savedFile });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

filesRouter.post('/folder/:folderId/upload', upload.single('file'), async (req: any, res) => {
    try {
        const { folderId } = req.params;
        const { originalname, buffer, mimetype } = req.file;
        const user = req.user;

        const folderRepository = myDataSource.getRepository(Folder);

        const folder = await folderRepository.findOne(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        if (folder.user !== user) {
            return res.status(401).json({ message: 'Not Allowed' });
        }

        let result;

        const bufferNew = path.join(originalname);
        fs.writeFileSync(bufferNew, buffer);

        if (mimetype.startsWith('image') || mimetype.startsWith('video') || mimetype.startsWith('audio')) {
            if (buffer.length <= 90 * 1024 * 1024) {
                result = await cloudinary.uploader.upload(bufferNew);
            } else {
                result = await cloudinary.uploader.upload_large(bufferNew, { resource_type: 'auto' });
            }
        } else if (mimetype === 'application/pdf' || mimetype === 'application/msword' || mimetype === 'application/zip' || mimetype === 'text/plain' || mimetype === 'text/csv') {
            result = await cloudinary.uploader.upload(bufferNew, {
                resource_type: 'raw',
                folder: 'documents/',
            });
        } else {
            res.status(400).json({ message: 'File type not supported!' });
        }

        if (!result) {
            return res.status(500).json({ message: 'File upload failed' });
        }

        fs.unlinkSync(bufferNew);

        const fileRepository = myDataSource.getRepository(File);
        const slug = await slugGenerator.generate(6, { upperCase: false, specialChars: false });
        const currentTime = new Date();
        const dateUploaded = new Date(currentTime);
        dateUploaded.setDate(currentTime.getDate());
        const newFile = fileRepository.create({
            slug: slug,
            originalFileName: originalname,
            dateUploaded: dateUploaded,
            fileType: mimetype,
            fileUrl: result.secure_url,
            folder: folder,
        });

        const savedFile = await fileRepository.save(newFile);
        folder.lastEditedOn = dateUploaded;
        await folderRepository.save(folder);

        res.status(200).json({ message: 'SUCCESSFUL', file: savedFile });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file' });
    }
});


export default filesRouter;
