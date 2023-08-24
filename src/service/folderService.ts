import {User} from "../data/entities/User";
import {myDataSource} from "../database";
import {Folder} from "../data/entities/Folder";
import {FileNotFoundException} from "../exceptions/FileNotFoundException";
import {FolderNotFoundException} from "../exceptions/FolderNotFoundException";
import {findFilesByFolder, getFileById, saveFile} from "./fileService";


const slugGenerator = require('otp-generator');
const folderRepository = myDataSource.getRepository(Folder);


export async function createNewFolder(folderName: string, user: User) {
    const slug = await slugGenerator.generate(6, { upperCase: false, specialChars: false });
    const currentTime = new Date();
    const dateUploaded = new Date(currentTime);
    dateUploaded.setDate(currentTime.getDate());

    const newFolder = folderRepository.create({
        name: folderName,
        user: user,
        slug: slug,
        dateUploaded: dateUploaded,
        lastEditedOn: dateUploaded,
    });

    return await folderRepository.save(newFolder);
}


export async function getFilesInFolder(folderId: number, user: User) {
    const folder = await folderRepository.findOne({ where: { id: folderId, user: { id: user.id } }});
    if (!folder) {
        throw new FileNotFoundException('File not found');
    }
    return  await findFilesByFolder(folder);
}


export async function findFolderBySlug(slug: string, user: User) {
    const folder = await folderRepository.findOne( { where: { slug: slug, user: { id: user.id } }});
    if (!folder) {
        throw new FolderNotFoundException('Folder not found!');
    }
    return folder;
}


export async function addFileToFolder(folderId: number, fileId: number, user: User) {
    const folder = await folderRepository.findOne( { where: { id: folderId, user: { id: user.id } }});
    if (!folder) {
        throw new FolderNotFoundException('Folder not found!');
    }
    const file = await getFileById(fileId, user);
    file.folder = folder;
    await saveFile(file);
    const currentTime = new Date();
    const dateUploaded = new Date(currentTime);
    dateUploaded.setDate(currentTime.getDate());
    folder.lastEditedOn = dateUploaded;
    await folderRepository.save(folder);
    return folder;
}

