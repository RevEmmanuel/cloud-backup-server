import {Router} from 'express';
import {myDataSource} from "../database";
import {Folder} from "../entities/Folder";
import { File } from '../entities/File';


const folderRouter = Router();
const slugGenerator = require('otp-generator');

folderRouter.post('/create', async (req: any, res) => {
    try {
        const { folderName } = req.body;
        if (!folderName) {
            return res.status(400).json({ message: 'Missing name field' });
        }
        const user = req.user;

        const slug = await slugGenerator.generate(6, { upperCase: false, specialChars: false });
        const currentTime = new Date();
        const dateUploaded = new Date(currentTime);
        dateUploaded.setDate(currentTime.getDate());

        const folderRepository = myDataSource.getRepository(Folder);
        const newFolder = folderRepository.create({
            name: folderName,
            user: user,
            slug: slug,
            dateUploaded: dateUploaded,
            lastEditedOn: dateUploaded,
        });

        const savedFolder = await folderRepository.save(newFolder);
        res.status(201).json({ message: 'Folder created successfully!', folder: savedFolder });
    } catch (error) {
        res.status(500).json({ message: 'Error creating folder' });
    }
});

folderRouter.get('/folder/:folderId', async (req: any, res) => {
    const { folderId } = req.params;
    const user = req.user;

    try {
        const folderRepository = myDataSource.getRepository(Folder);
        const folder = await folderRepository.findOne(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        if (folder.user !== user) {
            return res.status(401).json({ message: 'Not Allowed' });
        }

        const fileRepository = myDataSource.getRepository(File);
        const files = await fileRepository.find({ where: { folder: folderId } });

        res.status(200).json({ files: files });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching files in folder' });
    }
});


folderRouter.get('/folder/:folderId/add', async (req: any, res) => {
    const { folderId } = req.params;
    const user = req.user;

    try {
        const folderRepository = myDataSource.getRepository(Folder);
        const folder = await folderRepository.findOne(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        if (folder.user !== user) {
            return res.status(401).json({ message: 'Not Allowed' });
        }

        const fileRepository = myDataSource.getRepository(File);
        const files = await fileRepository.find({ where: { folder: folderId } });

        res.status(200).json({ files: files });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching files in folder' });
    }
});

export default folderRouter;
