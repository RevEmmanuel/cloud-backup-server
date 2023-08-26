import express from 'express';
import { myDataSource } from '../database';
import { File } from '../data/entities/File';
import {FileNotFoundException} from "../exceptions/FileNotFoundException";

const downloadRouter = express.Router();


/**
 * @swagger
 * /download/{slug}:
 *   get:
 *     summary: Download a file by slug
 *     tags: [Download]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the file to be downloaded
 *     responses:
 *       302:
 *         description: Redirects to the file URL for download
 *       400:
 *         description: Bad request
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
downloadRouter.get('/:slug', async (req, res, next) => {
    const { slug } = req.params;

    try {
        const fileRepository = myDataSource.getRepository(File);
        const file = await fileRepository.findOne({ where: { slug } });

        if (!file) {
            throw new FileNotFoundException('File nt found!');
        }

        res.redirect(file.fileUrl);
    } catch (error) {
        next(error);
    }
});

export default downloadRouter;
