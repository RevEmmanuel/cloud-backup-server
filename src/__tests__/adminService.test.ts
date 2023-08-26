import {connectToDatabase, myDataSource} from "../database";


describe("File Service", () => {
    beforeAll(async function(){
        await connectToDatabase();
    });
    afterAll(async function(){
        await myDataSource.destroy();
    });



});


function getRandomValue(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomIndex1 = Math.floor(Math.random() * alphabet.length);
    const randomIndex2 = Math.floor(Math.random() * alphabet.length);
    const number = Math.random();
    return `${alphabet[randomIndex1]}${number}${alphabet[randomIndex2]}`;
}
