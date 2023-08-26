import {connectToDatabase, myDataSource} from "../database";
import {createNewUser} from "../service/authService";
import {User} from "../data/entities/User";
import fs from "fs";
import path from "path";
import {findFilesByFolder, uploadFileForUser} from "../service/fileService";
import {addFileToFolder, createNewFolder, findFolderBySlug} from "../service/folderService";
import {Folder} from "../data/entities/Folder";
import {UnauthorizedException} from "../exceptions/UnauthorizedException";
import {FolderNotFoundException} from "../exceptions/FolderNotFoundException";

describe("Folder Service", () => {
    beforeAll(async function(){
        await connectToDatabase();
    });
    afterAll(async function(){
        await myDataSource.destroy();
    });


    describe('Create folder', () => {
        it('Users can create a folder', async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `normal-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const regularUser = await createNewUser(signupDto);
            const userRepository = myDataSource.getRepository(User);
            regularUser.isVerified = true;
            await userRepository.save(regularUser);

            const newFolder = await createNewFolder('Test folder', regularUser);
            const folderRepository = myDataSource.getRepository(Folder);
            const foundFolder = folderRepository.findOneBy(newFolder);
            if (!foundFolder) {
                return;
            }
            expect(foundFolder).toBeDefined();
        });

    });


    describe('Find folder by slug', () => {
        it('Can search for a folder by slug', async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `normal-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const regularUser = await createNewUser(signupDto);
            const userRepository = myDataSource.getRepository(User);
            regularUser.isVerified = true;
            await userRepository.save(regularUser);

            const newFolder = await createNewFolder('Test folder', regularUser);
            const foundFolder = await findFolderBySlug(newFolder.slug, regularUser);
            if (!foundFolder) {
                return;
            }
            expect(foundFolder).toBeDefined();
        });

    });


    describe('Add file to folder', () => {
        it('Users can add a file to a folder', async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `normal-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const regularUser = await createNewUser(signupDto);
            const userRepository = myDataSource.getRepository(User);
            regularUser.isVerified = true;
            await userRepository.save(regularUser);

            const newFolder = await createNewFolder('Test folder', regularUser);
            const req = {
                file: {
                    originalname: 'imageTest.jpg',
                    buffer: fs.readFileSync(path.join(__dirname, 'imageTest.jpg')),
                    mimetype: 'image/jpeg',
                },
                user: {
                    user: regularUser,
                },
            };

            const file = await uploadFileForUser(req);
            const folder = await addFileToFolder(newFolder.id, file.id, regularUser);
            expect(folder).toBeDefined();
        });


        it('Users cannot add a file to a non-existing folder', async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `normal-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const regularUser = await createNewUser(signupDto);

            const req = {
                file: {
                    originalname: 'imageTest.jpg',
                    buffer: fs.readFileSync(path.join(__dirname, 'imageTest.jpg')),
                    mimetype: 'image/jpeg',
                },
                user: {
                    user: regularUser,
                },
            };

            const file = await uploadFileForUser(req);
            try {
                await addFileToFolder(1382, file.id, regularUser);
            } catch (error: any) {
                expect(error).toBeInstanceOf(FolderNotFoundException);
                expect(error.message).toBe('Folder not found!');
                expect(error.statusCode).toBe(404);
            }
        });


        it('Users cannot add a file to a folder twice', async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `normal-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const regularUser = await createNewUser(signupDto);
            const userRepository = myDataSource.getRepository(User);
            regularUser.isVerified = true;
            await userRepository.save(regularUser);

            const newFolder = await createNewFolder('Test folder', regularUser);
            const req = {
                file: {
                    originalname: 'imageTest.jpg',
                    buffer: fs.readFileSync(path.join(__dirname, 'imageTest.jpg')),
                    mimetype: 'image/jpeg',
                },
                user: {
                    user: regularUser,
                },
            };

            const file = await uploadFileForUser(req);
            await addFileToFolder(newFolder.id, file.id, regularUser);
            try {
                await addFileToFolder(newFolder.id, file.id, regularUser);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('File already exists in the folder');
                expect(error.statusCode).toBe(401);
            }
        });

    });


    describe('Get files in folder', () => {
        it('Users can get all files in a folder', async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `normal-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const regularUser = await createNewUser(signupDto);
            const userRepository = myDataSource.getRepository(User);
            regularUser.isVerified = true;
            await userRepository.save(regularUser);

            const newFolder = await createNewFolder('Test folder', regularUser);
            const req = {
                file: {
                    originalname: 'imageTest.jpg',
                    buffer: fs.readFileSync(path.join(__dirname, 'imageTest.jpg')),
                    mimetype: 'image/jpeg',
                },
                user: {
                    user: regularUser,
                },
            };

            const file = await uploadFileForUser(req);
            const file2 = await uploadFileForUser(req);
            await addFileToFolder(newFolder.id, file.id, regularUser);
            await addFileToFolder(newFolder.id, file2.id, regularUser);
            const folder = await findFilesByFolder(newFolder);
            expect(folder).toBeDefined();
            expect(folder.length).toBe(2);
        }, 10000);

    });

});

function getRandomValue(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomIndex1 = Math.floor(Math.random() * alphabet.length);
    const randomIndex2 = Math.floor(Math.random() * alphabet.length);
    const number = Math.random();
    return `${alphabet[randomIndex1]}${number}${alphabet[randomIndex2]}`;
}