import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create a user first
    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            name: 'Test User',
        },
    });

    // Create a roadmap for the user
    const roadmap = await prisma.roadmap.create({
        data: {
            name: 'Sample Roadmap',
            description: 'This is a sample roadmap.',
            userId: user.id,
        },
    });

    // Create topics and subtopics
    const topicData = [
        {
            id: 0,  // Set ID to 0
            name: 'Topic 1',
            description: 'Description for Topic 1',
            order: 1,
            roadmapId: roadmap.id,
        },
    ];

    for (const topic of topicData) {
        await prisma.topic.create({
            data: {
                ...topic,
                subtopics: {
                    create: [
                        { id: 0, name: 'Subtopic 1.1', description: 'Description for Subtopic 1.1', order: 1 },
                    ],
                },
            },
        });
    }

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });