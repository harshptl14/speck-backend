import { prisma } from '../../../utils/client';

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

async function deleteUser(userId: number): Promise<void> {
    try {
        // Start a transaction to ensure all operations are performed atomically
        await prisma.$transaction(async (tx) => {
            // Delete all progress entries related to the user
            await tx.progress.deleteMany({
                where: { userId: userId },
            })

            // Delete all roadmaps created by the user
            // This will cascade delete related topics, subtopics, content, videoContent, and textContent
            await tx.roadmap.deleteMany({
                where: { userId: userId },
            })

            // Finally, delete the user
            await tx.user.delete({
                where: { id: userId },
            })
        })

        console.log(`User with ID ${userId} and all related data have been deleted successfully.`)
    } catch (error) {
        console.error(`Error deleting user with ID ${userId}:`, error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}


export { getUserByEmail, insertUser, deleteUser };
