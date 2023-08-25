import express from 'express';
import { myDataSource } from '../database';
import { File } from '../data/entities/File';
import {FileNotFoundException} from "../exceptions/FileNotFoundException";

const downloadRouter = express.Router();

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
