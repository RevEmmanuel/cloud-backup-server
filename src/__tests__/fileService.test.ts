import {connectToDatabase, myDataSource} from "../database";
import {getFileById, uploadFileForUser} from "../service/fileService";
import fs from "fs";
import {createNewUser} from "../service/authService";
import {User} from "../data/entities/User";
import {FileNotFoundException} from "../exceptions/FileNotFoundException";
import path from "path";


describe("File Service", () => {
    beforeAll(async function(){
        await connectToDatabase();
    });
    afterAll(async function(){
        await myDataSource.destroy();
    });

    const path = require('path');

    describe('Upload file for user', () => {
        it('Uploads an image with small buffer', async () => {
            const fs = require('fs');
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
            expect(file).toBeDefined();
            expect(file.fileUrl).toBeDefined();
            expect(file.id).toBeDefined();
            expect(file.unsafeCount).toEqual(0);
            expect(file.isUnsafe).toEqual(false);
        });

    });


    describe('Get file by id', () => {
        it('User can get file by Id', async () => {
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
            const gottenFile = await getFileById(file.id, regularUser);
            if (!gottenFile) {
                return;
            }
            expect(file.id).toEqual(gottenFile.id);
            expect(file.originalFileName).toEqual(gottenFile.originalFileName);
            expect(file.fileUrl).toEqual(gottenFile.fileUrl);
            expect(file.slug).toEqual(gottenFile.slug);
        });

        it("A user cannot get another user's files", async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `normal-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };
            const signupDto2 = {
                email: `user-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const regularUser = await createNewUser(signupDto);
            const regularUser2 = await createNewUser(signupDto2);
            const userRepository = myDataSource.getRepository(User);
            regularUser.isVerified = true;
            regularUser2.isVerified = true;
            await userRepository.save(regularUser);
            await userRepository.save(regularUser2);
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
            expect.assertions(3);
            try {
                await getFileById(file.id, regularUser2);
            } catch (error: any) {
                expect(error).toBeInstanceOf(FileNotFoundException);
                expect(error.message).toBe('File not found!');
                expect(error.statusCode).toBe(404);
            }
        });


        it("Admin can get user's file", async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `normal-${random}-1@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };
            const signupDto2 = {
                email: `admin-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: true
            };

            const regularUser = await createNewUser(signupDto);
            const regularUser2 = await createNewUser(signupDto2);
            const userRepository = myDataSource.getRepository(User);
            regularUser.isVerified = true;
            regularUser2.isVerified = true;
            await userRepository.save(regularUser);
            await userRepository.save(regularUser2);
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
            const foundFile = await getFileById(file.id, regularUser2);
            if (!foundFile) {
                return;
            }
            expect(file.id).toEqual(foundFile.id);
            expect(file.originalFileName).toEqual(foundFile.originalFileName);
            expect(file.fileUrl).toEqual(foundFile.fileUrl);
            expect(file.slug).toEqual(foundFile.slug);
        });
    });

});


function getRandomValue(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomIndex1 = Math.floor(Math.random() * alphabet.length);
    const randomIndex2 = Math.floor(Math.random() * alphabet.length);
    const number = Math.random();
    return `${alphabet[randomIndex1]}${number}${alphabet[randomIndex2]}`;
}