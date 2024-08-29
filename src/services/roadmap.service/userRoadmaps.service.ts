import { PrismaClient } from "@prisma/client";

export const getUserRoadmaps = async (userId: number) => {
    try {
        const prisma = new PrismaClient();
        const roadmaps = await prisma.roadmap.findMany({
            where: {
                userId: userId,
            },
        });
        return roadmaps;
    } catch (error) {
        console.error('Error getting user roadmaps:', error);
        throw error;
    }
}