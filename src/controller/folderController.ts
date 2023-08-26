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


/**
 * @swagger
 * /folder/create:
 *   post:
 *     summary: Create a new folder
 *     tags: [Folder]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               folderName:
 *                 type: string
 *                 description: Name of the folder to create
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 folder:
 *                   $ref: '#/components/schemas/Folder' # Update with the correct schema reference
 *       400:
 *         description: Missing name field in the request body
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Internal server error
 */
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


/**
 * @swagger
 * /folder/{folderId}/files:
 *   get:
 *     summary: Get files in a specific folder
 *     tags: [Folder]
 *     parameters:
 *       - name: folderId
 *         in: path
 *         required: true
 *         description: ID of the folder to retrieve files from
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved files in the folder
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FileResponse' # Update with the correct schema reference
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Internal server error
 */
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


/**
 * @swagger
 * /folder/get/{slug}:
 *   get:
 *     summary: Get folder by slug
 *     tags: [Folder]
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         description: Slug of the folder to retrieve
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the folder
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 folder:
 *                   $ref: '#/components/schemas/FindFolderResponse' # Update with the correct schema reference
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Internal server error
 */
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


/**
 * @swagger
 * /folder/{folderId}/add/{fileId}:
 *   post:
 *     summary: Add a file to a folder
 *     tags: [Folder]
 *     parameters:
 *       - name: folderId
 *         in: path
 *         required: true
 *         description: ID of the folder to which the file should be added
 *         schema:
 *           type: string
 *       - name: fileId
 *         in: path
 *         required: true
 *         description: ID of the file to be added to the folder
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully added the file to the folder
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 folder:
 *                   $ref: '#/components/schemas/FindFolderResponse' # Update with the correct schema reference
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Internal server error
 */
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
