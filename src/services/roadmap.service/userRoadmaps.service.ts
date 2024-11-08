import { ProgressStatus } from "@prisma/client";
import { prisma } from "../../../utils/client";

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
            orderBy: {
                id: 'asc',
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
                        progress: true,
                    }
                },
            },
            orderBy: {
                id: 'asc',
            },
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


export const getRoadmapsInfoByUserIdService = async (userId: number) => {
    try {
        const userRoadmaps = await prisma.roadmap.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                name: true,
                progress: {
                    select: {
                        status: true
                    }
                }
            }
        });
        const totalRoadmapIds = userRoadmaps.map(roadmap => ({ id: roadmap.id }));

        const completedRoadmapIds = userRoadmaps
            .filter(roadmap =>
                roadmap.progress.length > 0 &&
                roadmap.progress.every(p => p.status === 'COMPLETED')
            )
            .map(roadmap => ({ roadmapId: roadmap.id }));

        const favoriteRoadmapIds = await prisma.favorite.findMany({
            where: {
                userId: userId,
            },
            select: {
                roadmapId: true,
            },
        });

        const courses = userRoadmaps.map(roadmap => {
            const completedTopics = roadmap.progress.filter(p => p.status === 'COMPLETED').length;
            const totalTopics = roadmap.progress.length;
            const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
            return {
                id: roadmap.id,
                name: roadmap.name,
                progress: progress,
                isCompleted: totalTopics > 0 && completedTopics === totalTopics
            };
        });

        return {
            totalRoadmapIds,
            completedRoadmapIds,
            favoriteRoadmapIds,
            courses
        };
    } catch (error) {
        console.error('Error getting roadmapsInfo by userId:', error);
        throw error;
    }
}

export const updateSubtopicCompletionService = async (
    roadmapId: number,
    topicId: number,
    subtopicId: number,
    newStatus: ProgressStatus,
    userId: number
) => {
    try {
        await prisma.$transaction(async (tx) => {
            // Update the status of the subtopic in the Progress table
            await tx.progress.upsert({
                where: {
                    userId_roadmapId_topicId_subtopicId: {
                        userId,
                        roadmapId,
                        topicId,
                        subtopicId,
                    },
                },
                update: { status: newStatus },
                create: {
                    userId,
                    roadmapId,
                    topicId,
                    subtopicId,
                    status: newStatus,
                },
            });

            if (newStatus === ProgressStatus.COMPLETED) {
                // Check if all subtopics in the topic are completed
                const subtopics = await tx.subtopic.findMany({ where: { topicId } });
                const completedSubtopics = await tx.progress.findMany({
                    where: {
                        userId,
                        roadmapId,
                        topicId,
                        status: ProgressStatus.COMPLETED,
                    },
                });

                if (subtopics.length === completedSubtopics.length) {
                    // Update topic progress
                    await tx.progress.upsert({
                        where: {
                            userId_roadmapId_topicId_subtopicId: {
                                userId,
                                roadmapId,
                                topicId,
                                subtopicId: 0,
                            },
                        },
                        update: { status: ProgressStatus.COMPLETED },
                        create: {
                            userId,
                            roadmapId,
                            topicId,
                            status: ProgressStatus.COMPLETED,
                        },
                    });

                    // Check if all topics in the roadmap are completed
                    const topics = await tx.topic.findMany({ where: { roadmapId } });
                    const completedTopics = await tx.progress.findMany({
                        where: {
                            userId,
                            roadmapId,
                            // topicId: null,
                            subtopicId: 0,
                            status: ProgressStatus.COMPLETED,
                        },
                    });

                    console.log('topics:', topics);
                    console.log('completedTopics:', completedTopics);


                    if (topics.length === completedTopics.length) {
                        console.log('All topics are completed', topics.length === completedTopics.length);

                        await tx.progress.upsert({
                            where: {
                                userId_roadmapId_topicId_subtopicId: {
                                    userId,
                                    roadmapId,
                                    topicId: 0,
                                    subtopicId: 0,
                                },
                            },
                            update: { status: ProgressStatus.COMPLETED },
                            create: {
                                userId,
                                roadmapId,
                                status: ProgressStatus.COMPLETED,
                            },
                        });
                    }
                }
            } else {
                // Handle cases for NOT_STARTED or IN_PROGRESS
                await tx.progress.upsert({
                    where: {
                        userId_roadmapId_topicId_subtopicId: {
                            userId,
                            roadmapId,
                            topicId,
                            subtopicId: 0,
                        },
                    },
                    update: { status: ProgressStatus.IN_PROGRESS },
                    create: {
                        userId,
                        roadmapId,
                        topicId,
                        status: ProgressStatus.IN_PROGRESS,
                    },
                });

                await tx.progress.upsert({
                    where: {
                        userId_roadmapId_topicId_subtopicId: {
                            userId,
                            roadmapId,
                            topicId: 0,
                            subtopicId: 0,
                        },
                    },
                    update: { status: ProgressStatus.IN_PROGRESS },
                    create: {
                        userId,
                        roadmapId,
                        status: ProgressStatus.IN_PROGRESS,
                    },
                });
            }
        });
    } catch (error) {
        console.error('Error updating subtopic completion:', error);
        throw error;
    }
};


export const resetRoadmapProgressService = async (
    roadmapId: string,
    userId: number
) => {
    try {
        await prisma.$transaction(async (tx) => {
            // Reset all subtopics progress
            await tx.progress.updateMany({
                where: {
                    userId,
                    roadmapId: Number(roadmapId),
                },
                data: {
                    status: ProgressStatus.NOT_STARTED,
                },
            });
        });

        console.log(`Progress reset for roadmap ${roadmapId} and user ${userId}`);
    } catch (error) {
        console.error('Error resetting roadmap progress:', error);
        throw error;
    }
};