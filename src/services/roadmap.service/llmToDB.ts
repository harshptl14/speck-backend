import { prisma } from '../../../utils/client';

export async function insertJsonToPrisma(jsonData: any, courseMetadata: any, userId: number, roadmapName: string): Promise<number> {
    console.log('Inserting data...', jsonData);
    console.log('type of data', typeof jsonData);
    console.log('courseName', roadmapName);

    try {
        const roadmap = await prisma.$transaction(async (tx) => {
            const createdRoadmap = await tx.roadmap.create({
                data: {
                    name: roadmapName,
                    description: courseMetadata.courseInfo,
                    userId: userId,
                    markdown: courseMetadata.markdownRoadmap,
                },
            });

            const topicPromises = jsonData.topics.map(async (topic: any) => {
                const createdTopic = await tx.topic.create({
                    data: {
                        name: topic.name,
                        description: topic.description,
                        order: topic.order,
                        roadmapId: createdRoadmap.id,
                    },
                });

                const subtopicPromises = topic.subtopics.map((subtopic: any) =>
                    tx.subtopic.create({
                        data: {
                            name: subtopic.name,
                            description: subtopic.description,
                            order: subtopic.order,
                            topicId: createdTopic.id,
                        },
                    })
                );

                await Promise.all(subtopicPromises);
            });

            await Promise.all(topicPromises);

            return createdRoadmap;
        });

        console.log('Data inserted successfully');
        return roadmap.id;
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}