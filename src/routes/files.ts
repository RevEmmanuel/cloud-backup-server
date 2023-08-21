import {Router} from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinaryConfig';
import {myDataSource} from "../database";
import {VerificationOtp} from "../entities/VerificationOtp";
import {File} from "../entities/File";


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadRouter = Router();
const slugGenerator = require('otp-generator');

uploadRouter.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { originalname, buffer } = req.file;

        const result = await cloudinary.uploader.upload(buffer);

        const fileRepository = myDataSource.getRepository(File);
        const slug = await slugGenerator.generate(6, { upperCase: false, specialChars: false });
        const currentTime = new Date();
        const dateUploaded = new Date(currentTime);
        dateUploaded.setDate(currentTime.getDate());
        const newFile = fileRepository.create({
            slug,
            originalFileName: originalname,
            dateUploaded,
        });

        await fileRepository.save(newFile);

        res.json(result);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});


export default uploadRouter;