import {connectToDatabase, myDataSource} from "../database";
import {createNewUser, loginUser} from "../service/authService";
import {UserNotFoundException} from "../exceptions/UserNotFoundException";
import {User} from "../data/entities/User";
import {UnauthorizedException} from "../exceptions/UnauthorizedException";
import {deleteUser, getUserById, revokeUserSessions} from "../service/userService";


describe("User Service Test", () => {
    beforeAll(async function(){
        await connectToDatabase();
    });
    afterAll(async function(){
        await myDataSource.destroy();
    });
    describe("Get User By Id",() => {

        it('Admin can get user by id',async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `admin-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: true
            };

            const adminUser = await createNewUser(signupDto);
            signupDto.isAdmin = false;
            signupDto.email = `test-${random}@example.com`
            const regularUser = await createNewUser(signupDto);
            const foundUser = await getUserById(regularUser.id, adminUser);
            if (!foundUser) {
                return;
            }
            expect(foundUser).toEqual(regularUser);
        });

        it('Normal user cannot get user by id',async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `admin-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: true
            };

            const adminUser = await createNewUser(signupDto);
            signupDto.isAdmin = false;
            signupDto.email = `test-${random}@example.com`
            const regularUser = await createNewUser(signupDto);
            const foundUser = await getUserById(regularUser.id, adminUser);
            if (!foundUser) {
                return;
            }
            expect.assertions(3);
            try {
                await getUserById(adminUser.id, regularUser);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('Method Not Allowed');
                expect(error.statusCode).toBe(401);
            }
        });
    });


    describe("Delete User",  () => {
        it('User should be able to delete his account', async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `admin-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: true
            };

            const adminUser = await createNewUser(signupDto);
            signupDto.isAdmin = false;
            signupDto.email = `test-${random}@example.com`
            const regularUser = await createNewUser(signupDto);
            const foundUser = await getUserById(regularUser.id, adminUser);
            if (!foundUser) {
                return;
            }

            const loginRequest = {
                email: `test-${random}@example.com`,
                password: 'password',
            };

            await deleteUser(regularUser.id, signupDto.password, regularUser);
            expect.assertions(3);
            try {
                await loginUser(loginRequest);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UserNotFoundException);
                expect(error.message).toBe('User not found!');
                expect(error.statusCode).toBe(404);
            }
        });

        it('Admin should be able to delete user account', async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `admin-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: true
            };

            const adminUser = await createNewUser(signupDto);
            signupDto.isAdmin = false;
            signupDto.email = `test-${random}@example.com`
            const regularUser = await createNewUser(signupDto);
            const foundUser = await getUserById(regularUser.id, adminUser);
            if (!foundUser) {
                return;
            }

            const loginRequest = {
                email: `test-${random}@example.com`,
                password: 'password',
            };
            await deleteUser(regularUser.id, signupDto.password, adminUser);
            expect.assertions(3);
            try {
                await loginUser(loginRequest);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UserNotFoundException);
                expect(error.message).toBe('User not found!');
                expect(error.statusCode).toBe(404);
            }
        });

        it('User cannot delete account twice', async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `admin-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: true
            };

            const adminUser = await createNewUser(signupDto);
            signupDto.isAdmin = false;
            signupDto.email = `test-${random}@example.com`
            const regularUser = await createNewUser(signupDto);
            const foundUser = await getUserById(regularUser.id, adminUser);
            if (!foundUser) {
                return;
            }

            expect.assertions(3);
            await deleteUser(regularUser.id, signupDto.password, regularUser);
            try {
                await deleteUser(regularUser.id, signupDto.password, regularUser);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('Account does not exist');
                expect(error.statusCode).toBe(401);
            }
        });

        it("A user cannot delete another user's account", async () => {
            const random = getRandomValue();
            const signupDto = {
                email: `admin-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: true
            };

            const adminUser = await createNewUser(signupDto);
            signupDto.isAdmin = false;
            signupDto.email = `test-${random}@example.com`
            const regularUser = await createNewUser(signupDto);
            const foundUser = await getUserById(regularUser.id, adminUser);
            if (!foundUser) {
                return;
            }

            const signupDto2 = {
                email: `normal-${random}@example.com`,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const res = await createNewUser(signupDto2);
            expect.assertions(3);
            try {
                await deleteUser(regularUser.id, signupDto.password, res);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('You are not authorized to perform this action!');
                expect(error.statusCode).toBe(401);
            }
        });

    });


    describe("Revoke user sessions", () => {

        it('User can revoke sessions', async () => {
            const random = getRandomValue();
            const email = `test-${random}@example.com`;
            const signupDto = {
                email: email,
                password: 'password',
                fullName: 'Test User',
                isAdmin: false
            };

            const loginRequest = {
                email: email,
                password: 'password'
            };

            await createNewUser(signupDto);
            const foundUser = await myDataSource.getRepository(User).findOneBy({ email: email });
            if (!foundUser) {
                return;
            }
            foundUser.isVerified = true;
            await myDataSource.getRepository(User).save(foundUser);

            await loginUser(loginRequest);
            const result = await revokeUserSessions(foundUser);
            expect(result).toEqual(true);
        });

        it('User cannot revoke sessions if no session is active', async () => {
            const random = getRandomValue();
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
            foundUser.isVerified = true;
            await myDataSource.getRepository(User).save(foundUser);

            expect.assertions(3);
            try {
                await revokeUserSessions(foundUser);
            } catch (error: any) {
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('No active sessions found');
                expect(error.statusCode).toBe(401);
            }
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
