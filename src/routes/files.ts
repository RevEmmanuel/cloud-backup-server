import {Router} from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinaryConfig';


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadRouter = Router();

uploadRouter.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await cloudinary.uploader.upload(req.file.buffer);

        res.json(result);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});


export default uploadRouter;