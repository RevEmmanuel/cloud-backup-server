import {myDataSource} from "../database";
import {File} from "../data/entities/File";
import {User} from "../data/entities/User"
import {Folder} from "../data/entities/Folder";
import {FileNotFoundException} from "../exceptions/FileNotFoundException";
import {UnauthorizedException} from "../exceptions/UnauthorizedException";
import path from "path";
import fs from "fs";
import cloudinary from "../configAndUtils/cloudinaryConfig";
import {FileNotSupportedException} from "../exceptions/FileNotSupportedException";
import {UploadException} from "../exceptions/UploadException";


const fileRepository = myDataSource.getRepository(File);
const slugGenerator = require('otp-generator');


export async function getAllFiles(user: User) {
    return await myDataSource.manager.find(File);
}


export async function getAllServerFiles() {
    return await fileRepository.find();
}


export async function uploadFileForUser(req: any) {
    const { originalname, buffer, mimetype } = req.file;
    const user = req.user.user;

    let result;

    const bufferNew = path.join(originalname);
    fs.writeFileSync(bufferNew, buffer);

    if (mimetype.startsWith('image') || mimetype.startsWith('video') || mimetype.startsWith('audio')) {
        if (buffer.length <= 90 * 1024 * 1024) {
            result = await cloudinary.uploader.upload(bufferNew);
        } else {
            result = await cloudinary.uploader.upload_large(bufferNew, { resource_type: 'auto' });
        }
    } else if (mimetype === 'application/pdf' || mimetype === 'application/msword' || mimetype === 'application/zip' || mimetype === 'text/plain' || mimetype === 'text/csv') {
        result = await cloudinary.uploader.upload(bufferNew, {
            resource_type: 'raw',
            folder: 'documents/',
        });
    } else {
        throw new FileNotSupportedException('File type not supported!');
    }

    if (!result) {
        throw new UploadException('File upload failed');
    }

    fs.unlinkSync(bufferNew);

    const fileRepository = myDataSource.getRepository(File);
    const slug = await slugGenerator.generate(6, { upperCase: false, specialChars: false });
    const currentTime = new Date();
    const dateUploaded = new Date(currentTime);
    dateUploaded.setDate(currentTime.getDate());
    const newFile = fileRepository.create({
        slug,
        originalFileName: originalname,
        dateUploaded,
        fileType: mimetype,
        fileUrl: result.secure_url,
        user: user,
    });
    return await fileRepository.save(newFile);
}

export async function getFileById(fileId: number, user: User) {
    const foundFile = await fileRepository.findOne({where: {user: user, id: fileId}});
    if (!foundFile) {
        throw new FileNotFoundException('File not found!');
    }
    if (foundFile.user !== user && user.role !== 'ADMIN') {
        throw new UnauthorizedException('Not allowed!');
    }
    return foundFile;
}

export async function saveFile(file: File) {
    await fileRepository.save(file);
}

export async function findFilesByFolder(folder: Folder) {
    return await fileRepository.find({where: {folder: folder}});
}

