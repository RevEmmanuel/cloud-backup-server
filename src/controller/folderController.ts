import {Router} from 'express';
import { File } from '../data/entities/File';
import {
    addFileToFolder,
    createNewFolder,
    findFolderBySlug,
    getFilesInFolder,
} from "../service/folderService";
import {instanceToPlain} from "class-transformer";
import {FindFolderResponse} from "../data/dtos/responses/FindFolderResponse";
import CreateFolderResponse from "../data/dtos/responses/CreateFolderResponse";
import {FindFileResponse} from "../data/dtos/responses/FindFileResponse";


const folderRouter = Router();


async function convertFilesToFileResponse(foundFiles: File[]) {
    let findFileResponses: FindFileResponse[] =  [];
    for (const aFile of foundFiles) {
        findFileResponses.push(await instanceToPlain(foundFiles, { excludeExtraneousValues: true }) as FindFileResponse);
    }
    return findFileResponses;
}


folderRouter.post('/create', async (req: any, res, next) => {
    try {
        const { folderName } = req.body;
        if (!folderName) {
            return res.status(400).json({ message: 'Missing name field' });
        }
        const user = req.user.user;
        const createdFolder = await createNewFolder(folderName, user);
        const createFolderResponse = await instanceToPlain(createdFolder, { excludeExtraneousValues: true }) as CreateFolderResponse;
        res.status(201).json({ message: 'Folder created successfully!', folder: createFolderResponse });
    } catch (error) {
        next(error);
    }
});


folderRouter.get('/:folderId/files', async (req: any, res, next) => {
    const { folderId } = req.params;
    const user = req.user.user;

    try {
        const foundFiles = await getFilesInFolder(folderId, user);
        const files = await convertFilesToFileResponse(foundFiles);
        res.status(200).json({ files: files });
    } catch (error) {
        next(error);
    }
});


folderRouter.get('/get/:slug', async (req: any, res, next) => {
    const { slug } = req.params;
    const user = req.user.user;

    try {
        const foundFolder = await findFolderBySlug(slug, user);
        const findFolderResponse = await instanceToPlain(foundFolder, { excludeExtraneousValues: true }) as FindFolderResponse;
        res.status(200).json({ folder: findFolderResponse });
    } catch (error) {
        next(error);
    }
});


folderRouter.post('/:folderId/add/:fileId', async (req: any, res, next) => {
    const { folderId, fileId } = req.params;
    const user = req.user.user;

    try {
        const folder = await addFileToFolder(folderId, fileId, user);
        const folderResponse = await instanceToPlain(folder, { excludeExtraneousValues: true }) as FindFolderResponse;
        res.status(200).json({ folder: folderResponse });
    } catch (error) {
        next(error);
    }
});


export default folderRouter;
