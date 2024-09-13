import prisma from '../../../utils/client';

// Function to get a user by email
async function getUserByEmail(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        return user;
    } catch (error) {
        console.error('Error retrieving user:', error);
        throw error;
    }
}

// Function to insert a new user
async function insertUser(user: { email: string, name: string }) {
    try {
        const newUser = await prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
            },
        });
        return newUser;
    } catch (error) {
        console.error('Error inserting user:', error);
        throw error;
    }
}

export { getUserByEmail, insertUser };
