import {createNewUser} from "../service/authService";
import {connectToDatabase, myDataSource} from "../database";


describe("Auth Service", () => {
    beforeAll(async function(){
        await connectToDatabase();
    });

    afterAll(async function(){
       await myDataSource.destroy();
    });

    describe("Register User", () => {
        it('should create a new user and send verification email', async () => {

            const signupDto = {
                email: 'test@example.com',
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

           const res = createNewUser(signupDto);


            // const res = await request(app).post('/auth/signup').send(signupDto);
            // expect(res.statusCode).toEqual(201);
        });
    });
});


