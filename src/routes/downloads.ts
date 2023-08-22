import express from 'express';
import { myDataSource } from '../database';
import { File } from '../entities/File';
import https from 'https';
import fs from 'fs';
import path from 'path';

const downloadRouter = express.Router();

downloadRouter.get('/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const fileRepository = myDataSource.getRepository(File);
        const file = await fileRepository.findOne({ where: { slug } });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filename = path.basename(file.fileUrl);
        const filePath = path.join('downloads', filename);

        await downloadFile(file.fileUrl, filePath);

        // Set the Content-Disposition header for downloading
        res.header('Content-Disposition', `attachment; filename="${file.originalFileName}"`);
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: 'Error downloading file' });
    }
});

async function downloadFile(url: string, filePath: string) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(filePath);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file. Status code: ${response.statusCode}`));
                return;
            }

            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log('Download finished');
                // resolve();
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
    });
}

export default downloadRouter;
