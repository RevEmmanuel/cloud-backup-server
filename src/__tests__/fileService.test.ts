import {connectToDatabase, myDataSource} from "../database";
import {uploadFileForUser} from "../service/fileService";


describe("File Service", () => {
    beforeAll(async function(){
        await connectToDatabase();
    });
    afterAll(async function(){
        await myDataSource.destroy();
    });

    describe('Upload file for user', () => {
        it('Uploads an image with small buffer', async () => {
            const req = {
                file: {
                    originalname: 'image.jpg',
                    buffer: Buffer.from('fake-image-data'),
                    mimetype: 'image/jpeg',
                },
                user: {
                    user: {
                        email: `test@example.com`,
                        id: 10
                    },
                },
            };

            const file = await uploadFileForUser(req);
            expect(file).toBeDefined();
            expect(file.fileUrl).toBeDefined();
            expect(file.id).toBeDefined();
            expect(file.unsafeCount).toEqual(0);
            expect(file.isUnsafe).toEqual(false);
        });

        // ... Add more test cases for other scenarios
    });

});