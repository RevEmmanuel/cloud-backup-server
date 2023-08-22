import express from 'express';
import { myDataSource } from '../database';
import { File } from '../entities/File';

const downloadRouter = express.Router();
const https = require('https');
const fs = require('fs');
const path = require('path');

downloadRouter.get('/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const fileRepository = myDataSource.getRepository(File);
        const file = await fileRepository.findOne({ where: { slug } });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        downloadFile(file.fileUrl);

        res.redirect(file.fileUrl);
    } catch (error) {
        res.status(500).json({ message: 'Error downloading file' });
    }
});

function downloadFile(url: string) {
    const filename = path.basename(url);

    https.get(url, (res: any) => {
        const fileStream = fs.createWriteStream(filename);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            console.log('Download finished')
        });
    })
}


export default downloadRouter;
