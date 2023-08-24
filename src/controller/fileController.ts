import {Router} from 'express';
import multer from 'multer';
import {File} from "../data/entities/File";
import {getAllFilesForUser, getFileBySlug, uploadFileForUser} from "../service/fileService";
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


filesRouter.get('/', async (req: any, res, next) => {
    try {
        const user = req.user.user;
        const files = await getAllFilesForUser(user);
        const fileResponses = await convertFilesToFileResponse(files);
        res.status(200).json({ files: files });
    } catch (error) {
        next(error);
    }
});


filesRouter.post('/upload', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const savedFile = await uploadFileForUser(req);
        const fileResponse = await instanceToPlain(savedFile, { excludeExtraneousValues: true }) as FindFileResponse;
        res.status(200).json({ message: 'SUCCESSFUL', file: fileResponse });
    } catch (error) {
        next(error);
    }
});


filesRouter.get('/:slug', async (req: any, res, next) => {
    try {
        const { slug } = req.params;
        const user = req.user.user;
        const file = await getFileBySlug(slug, user);
        const fileResponse = await instanceToPlain(file, { excludeExtraneousValues: true }) as FindFileResponse;
        res.status(200).json({ file: fileResponse });
    } catch (error) {
        next(error);
    }
});


export default filesRouter;
