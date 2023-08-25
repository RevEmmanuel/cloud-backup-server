import { app } from '../app'
import request from 'supertest';


describe("Auth", () => {

    describe("Register USer", () => {
        it('should create a new user and send verification email', async () => {
            const signupDto = {
                email: 'test@example.com',
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const res = await request(app).post('/auth/signup').send(signupDto);
            expect(res.statusCode).toEqual(201);
        });
    });
});


