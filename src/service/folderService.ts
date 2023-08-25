import {User} from "../data/entities/User";
import {myDataSource} from "../database";
import {Folder} from "../data/entities/Folder";
import {FileNotFoundException} from "../exceptions/FileNotFoundException";
import {FolderNotFoundException} from "../exceptions/FolderNotFoundException";
import {findFilesByFolder, getFileById, saveFile} from "./fileService";
import {File} from "../data/entities/File";
import {UnauthorizedException} from "../exceptions/UnauthorizedException";


const slugGenerator = require('otp-generator');
const folderRepository = myDataSource.getRepository(Folder);
const fileRepository = myDataSource.getRepository(File);


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
    const fileExistsAlready = await fileRepository.findOneBy({ id: fileId, user: { id: user.id }, folder: folder });
    if (fileExistsAlready) {
        throw new UnauthorizedException('File already exists in the folder');
    }
    const file = await getFileById(fileId, user);
    if (!file) {
        throw new FileNotFoundException('File not found');
    }
    file.folder = folder;
    await saveFile(file);
    const currentTime = new Date();
    const dateUploaded = new Date(currentTime);
    dateUploaded.setDate(currentTime.getDate());
    folder.lastEditedOn = dateUploaded;
    await folderRepository.save(folder);
    return folder;
}

