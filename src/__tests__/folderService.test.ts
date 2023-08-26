import {connectToDatabase, myDataSource} from "../database";

describe("File Service", () => {
    beforeAll(async function(){
        await connectToDatabase();
    });
    afterAll(async function(){
        await myDataSource.destroy();
    });



});