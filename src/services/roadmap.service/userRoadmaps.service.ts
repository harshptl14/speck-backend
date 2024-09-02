import { PrismaClient } from "@prisma/client";

export const getUserRoadmaps = async (userId: number) => {
    console.log('userId: in userRoadmaps services:', userId);

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

export const getRoadmapByIdService = async (roadmapId: number) => {
    try {
        const prisma = new PrismaClient();
        const roadmap = await prisma.roadmap.findUnique({
            where: {
                id: roadmapId,
            },
        });

        const topicCount = await prisma.topic.count({
            where: {
                roadmapId: roadmapId,
            },
        });

        const topics = await prisma.topic.findMany({
            where: {
                roadmapId: roadmapId,
            },
            include: {
                subtopics: true,
            },
        });

        let subtopicCount = 0;
        topics.forEach((topic) => {
            subtopicCount += topic.subtopics.length;
        });

        // Write a function to calculate the approximate time to complete the roadmap
        // based on the number of topics and subtopics
        const calculateApproximateTime = () => {
            // Assuming each topic takes 1 hour and each subtopic takes 30 minutes
            const topicTime = topicCount * 1;
            const subtopicTime = subtopicCount * 0.5;
            const totalTime = topicTime + subtopicTime;
            return totalTime;
        };

        const approximateTime = calculateApproximateTime();
        return {
            roadmap,
            topicCount,
            subtopicCount,
            approximateTime,
        };

    } catch (error) {
        console.error('Error getting roadmap by id:', error);
        throw error;
    }
}