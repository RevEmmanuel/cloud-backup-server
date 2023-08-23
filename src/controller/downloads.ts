import express from 'express';
import { myDataSource } from '../database';
import { File } from '../data/entities/File';

const downloadRouter = express.Router();

downloadRouter.get('/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const fileRepository = myDataSource.getRepository(File);
        const file = await fileRepository.findOne({ where: { slug } });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.redirect(file.fileUrl);
    } catch (error) {
        res.status(500).json({ message: 'Error downloading file' });
    }
});

export default downloadRouter;
