import {Router} from 'express';
import multer from 'multer';
import {File} from "../data/entities/File";
import {getAllFiles, uploadFileForUser} from "../service/fileService";
import {FindFileResponse} from "../data/dtos/responses/FindFileResponse";
import {instanceToPlain} from "class-transformer";


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const filesRouter = Router();


async function convertFilesToFileResponse(foundFiles: File[]) {
    let findFileResponses: FindFileResponse[] =  [];
    for (const aFile of foundFiles) {
        findFileResponses.push(instanceToPlain(foundFiles, { excludeExtraneousValues: true }) as FindFileResponse);
    }
    return findFileResponses;
}


filesRouter.get('/', async (req: any, res) => {
    try {
        const user = req.user;
        const files = await getAllFiles(user);
        const fileResponses = await convertFilesToFileResponse(files);
        res.status(200).json({ files: fileResponses });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching files' });
    }
});


filesRouter.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const savedFile = await uploadFileForUser(req);
        const fileResponse = await instanceToPlain(savedFile, { excludeExtraneousValues: true }) as FindFileResponse;
        res.status(200).json({ message: 'SUCCESSFUL', file: fileResponse });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});


export default filesRouter;
