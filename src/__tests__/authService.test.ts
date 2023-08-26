import {connectToDatabase, myDataSource} from "../database";
import {createNewUser, loginUser, registerAdmin, restoreUserEmail, storeOTPInDatabase} from "../service/authService";
import {EmailAlreadyExistsException} from "../exceptions/EmailAlreadyExists";
import {AccountNotVerifiedException} from "../exceptions/AccountNotVerifiedException";
import {UserNotFoundException} from "../exceptions/UserNotFoundException";
import {User} from "../data/entities/User";
import {CloudServerException} from "../exceptions/GlobalException";
import {IncorrectPasswordException} from "../exceptions/IncorrectPasswordException";
import {AccountDisabledException} from "../exceptions/AccountDisabledException";
import {UnauthorizedException} from "../exceptions/UnauthorizedException";


describe("Auth Service Test", () => {
    beforeAll(async function(){
        await connectToDatabase();
    });
    afterAll(async function(){
        await myDataSource.destroy();
    });
    describe("Register User", () => {
        const random = getRandomValue();
        const signupDto = {
            email: `test-${random}@example.com`,
            password: 'password',
            fullName: 'Test User',
            isAdmin: false
        };
        it('Should create a new user and send verification email', async () => {
           const res = await createNewUser(signupDto);
            expect(res.email).toEqual(signupDto.email);
            expect(res.fullName).toEqual(signupDto.fullName);
            expect(res.role).toEqual('USER');
        });

        it('Should not create a new user with the same email', async () => {
            expect.assertions(3);
            try {
                await createNewUser(signupDto);
            } catch (error: any) {
                expect(error).toBeInstanceOf(EmailAlreadyExistsException);
                expect(error.message).toBe('This email is already registered!');
                expect(error.statusCode).toBe(400);
            }
        });

    });


    describe("User Login", () => {
        const random = getRandomValue();
        it('User should be able to login', async () => {
            const signupDto = {
                email: `test-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const res = await createNewUser(signupDto);
            const foundUser = await myDataSource.getRepository(User).findOneBy({ email: res.email });
            if (!foundUser) {
                return;
            }
            foundUser.isVerified = true;
            await myDataSource.getRepository(User).save(foundUser);
            const loginRequest = {
                email: `test-${random}@example.com`,
                password: 'password',
            };
            const token = await loginUser(loginRequest);
            expect(token).toBeDefined();
        });

        it('User should not be able to login with the wrong password', async () => {

            const loginRequest = {
                email: `test-${random}@example.com`,
                password: 'password-01',
            };

            expect.assertions(3);
            try {
                await loginUser(loginRequest);
            } catch (error: any) {
                expect(error).toBeInstanceOf(IncorrectPasswordException);
                expect(error.message).toBe('Incorrect Password!');
                expect(error.statusCode).toBe(401);
            }
        });

        it('Deleted user should not be able to login', async () => {
            const email = `test-${random}@example.com`;
            const foundUser = await myDataSource.getRepository(User).findOneBy({ email: email });
            if (!foundUser) {
                return;
            }
            foundUser.isDeleted = true;
            await myDataSource.getRepository(User).save(foundUser);
            const loginRequest = {
                email: `test-${random}@example.com`,
                password: 'password',
            };

            expect.assertions(3);
            try {
                await loginUser(loginRequest);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UserNotFoundException);
                expect(error.message).toBe('User not found!');
                expect(error.statusCode).toBe(404);
            }
        });

        it('Unverified user should not be able to login', async () => {
            const randomString = getRandomValue();
            const signupDto = {
                email: `test-${randomString}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const loginRequest = {
                email: `test-${randomString}@example.com`,
                password: 'password',
            };

            await createNewUser(signupDto);

            expect.assertions(3);
            try {
                await loginUser(loginRequest);
            } catch (error: any) {
                expect(error).toBeInstanceOf(AccountNotVerifiedException);
                expect(error.message).toBe('Please verify your account!');
                expect(error.statusCode).toBe(401);
            }
        });

        it('Disabled user should not be able to login', async () => {
            const randomString = getRandomValue();
            const signupDto = {
                email: `test-${randomString}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const res = await createNewUser(signupDto);
            const foundUser = await myDataSource.getRepository(User).findOneBy({ email: res.email });
            if (!foundUser) {
                return;
            }
            foundUser.isVerified = true;
            foundUser.isDisabled = true;
            await myDataSource.getRepository(User).save(foundUser);
            const loginRequest = {
                email: `test-${randomString}@example.com`,
                password: 'password',
            };

            expect.assertions(3);

            try {
                await loginUser(loginRequest);
            } catch (error: any) {
                expect(error).toBeInstanceOf(AccountDisabledException);
                expect(error.message).toBe('Account disabled!');
                expect(error.statusCode).toBe(403);
            }
        });

        it('Non existent user should not be able to login', async () => {
            const loginRequest = {
                email: 'fake@example.com',
                password: 'password',
            };

            expect.assertions(3);

            try {
                await loginUser(loginRequest);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UserNotFoundException);
                expect(error.message).toBe('User not found!');
                expect(error.statusCode).toBe(404);
            }
        });

    });


    describe("Restore user email", () => {
        const random = getRandomValue();

        it('Deleted user can restore account', async () => {
            const email = `test-${random}@example.com`;
            const signupDto = {
                email: email,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            await createNewUser(signupDto);
            const foundUser = await myDataSource.getRepository(User).findOneBy({ email: email });
            if (!foundUser) {
                return;
            }
            foundUser.isDeleted = true;
            await myDataSource.getRepository(User).save(foundUser);

            const result = await restoreUserEmail(email);
            foundUser.isDeleted = false;
            expect(result).toEqual(foundUser);
        });

        it('Undeleted user should not be able to restore account', async () => {
            const randomString = getRandomValue();
            const signupDto = {
                email: `test-${randomString}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            await createNewUser(signupDto);

            expect.assertions(3);
            try {
                await restoreUserEmail(signupDto.email);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('User account was not deleted');
                expect(error.statusCode).toBe(401);
            }
        });

        it('Non existent user should not be able to restore account', async () => {
            const email = 'fake@example.com';

            expect.assertions(3);
            try {
                await restoreUserEmail(email);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UserNotFoundException);
                expect(error.message).toBe('User not found!');
                expect(error.statusCode).toBe(404);
            }
        });

    });


    describe("Create Admin User", () => {
        const random = getRandomValue();
        it('Should create a new admin user and send verification email', async () => {
            const signupDto = {
                email: `test-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: true
            };

            const res = await createNewUser(signupDto);
            expect(res.email).toEqual(signupDto.email);
            expect(res.fullName).toEqual(signupDto.fullName);
            expect(res.role).toEqual('ADMIN');
        });

        it('Should not register a user who is already an admin', async () => {
            const email = `test-${random}@example.com`;

            expect.assertions(3);

            try {
                await registerAdmin(email);
            } catch (error: any) {
                expect(error).toBeInstanceOf(CloudServerException);
                expect(error.message).toBe('User is already an admin');
                expect(error.statusCode).toBe(400);
            }
        });

        it('Disabled user should not be able to register as admin', async () => {
            const email = `test-${random}@example.com`;
            const foundUser = await myDataSource.getRepository(User).findOneBy({ email: email });
            if (!foundUser) {
                return;
            }
            foundUser.isDisabled = true;
            await myDataSource.getRepository(User).save(foundUser);

            expect.assertions(3);
            try {
                await registerAdmin(email);
            } catch (error: any) {
                expect(error).toBeInstanceOf(AccountDisabledException);
                expect(error.message).toBe('Account disabled!');
                expect(error.statusCode).toBe(403);
            }
        });

        it('Non existent user should not be able to register as admin', async () => {
            const email = 'fake@example.com';

            expect.assertions(3);
            try {
                await registerAdmin(email);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UserNotFoundException);
                expect(error.message).toBe('User not registered!');
                expect(error.statusCode).toBe(404);
            }
        });

    });


    describe('DTO Conversion', () => {
        it('SignupRequest can be converted to User object', async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `test-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const res = await createNewUser(signupDto);
            expect(res.email).toEqual(signupDto.email);
            expect(res.fullName).toEqual(signupDto.fullName);
            expect(res.role).toEqual('USER');
        });
    });


    describe('Store OTP In Database', () => {

        it('Should store OTP in the database', async () => {
            const random = getRandomValue();
            const ownerEmail = `test-${random}@example.com`;
            const otp = '123456';

            const result = await storeOTPInDatabase(ownerEmail, otp);
            expect(result.ownerEmail).toEqual(ownerEmail);
            expect(result.otp).toEqual(otp);
            expect(result.expiresAt).toEqual(expect.any(Date));
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
