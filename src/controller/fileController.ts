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


/**
 * @swagger
 * /files:
 *   get:
 *     summary: Get all files for the authenticated user
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of files
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
filesRouter.get('/', async (req: any, res, next) => {
    try {
        const user = req.user.user;
        const files = await getAllFilesForUser(user);
        const fileResponses = await convertFilesToFileResponse(files);
        res.status(200).json({ files: fileResponses });
    } catch (error) {
        next(error);
    }
});



/**
 * @swagger
 * /files/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File upload successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 file:
 *                   $ref: '#/components/schemas/FindFileResponse' # Update with the correct schema reference
 *       400:
 *         description: Bad request, no file uploaded
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       500:
 *         description: Internal server error
 */
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


/**
 * @swagger
 * /files/{slug}:
 *   get:
 *     summary: Get file by slug
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 file:
 *                   $ref: '#/components/schemas/FindFileResponse' # Update with the correct schema reference
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
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
