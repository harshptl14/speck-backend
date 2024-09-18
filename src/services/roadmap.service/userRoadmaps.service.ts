import prisma from "../../../utils/client";

export const getUserRoadmaps = async (userId: number) => {
    console.log('userId: in userRoadmaps services:', userId);

    try {
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
            initialSubtopic: topics[0]?.subtopics[0]?.id,
        };

    } catch (error) {
        console.error('Error getting roadmap by id:', error);
        throw error;
    }
}

export const getTopicsByIdService = async (roadmapId: number) => {
    try {

        const roadmap = await prisma.roadmap.findUnique({
            where: {
                id: roadmapId,
            },
            select: {
                name: true,
            }
        });

        const topics = await prisma.topic.findMany({
            where: {
                roadmapId: roadmapId,
            },
            select: {
                name: true,
                id: true,
                subtopics: {
                    select: {
                        name: true,
                        id: true,
                    }
                }
            }
        });

        return {
            topics,
            roadmap
        };
    } catch (error) {
        console.error('Error getting topics by id:', error);
        throw error;
    }
}

export const getSubTopicByIdService = async (subtopicId: number) => {
    try {
        const subtopic = await prisma.subtopic.findUnique({
            where: {
                id: subtopicId,
            },
            include: {
                textContents: {
                    select: {
                        content: true,
                        id: true,
                    }
                },
            },
        });

        const normalVideoContents = await prisma.videoContent.findMany({
            where: {
                subtopicId: subtopicId,
                videoType: 'VIDEO',
            },
            select: {
                id: true,
                link: true,
                name: true,
                duration: true,
                thumbnail: true,
                videoType: true,
                transcript: true,
            }
        });

        const shortsVideoContents = await prisma.videoContent.findMany({
            where: {
                subtopicId: subtopicId,
                videoType: 'SHORTS',
            },
            select: {
                id: true,
                link: true,
                name: true,
                duration: true,
                thumbnail: true,
                videoType: true,
            }
        });

        const fianlObj = {
            subtopic,
            normalVideoContents,
            shortsVideoContents,
        };


        return {
            subtopic,
            normalVideoContents,
            shortsVideoContents,
        };
    } catch (error) {
        console.error('Error getting subtopic by id:', error);
        throw error;
    }
}