import { PromptTemplate } from "@langchain/core/prompts";
import { availaleRoadmapInDB } from "./topicExist.service";
import { groqModel } from "../../configs/longchain.config";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const getRoadmapTitleService = async (yourIntention: string, roadmapPrompt: string): Promise<string> => {
    try {

        const getTitlePrompt = PromptTemplate.fromTemplate(`
            Generate 5 concise and engaging titles for this query: "{roadmapPrompt}".
            The main goal of this is to {yourIntention}.
            Consider the following when creating the titles:

            Incorporate key words or concepts from the topic
            Reflect the main goal or intention
            Use action-oriented language where appropriate
            Keep titles clear, catchy, and under 10 words each

Please provide only the 5 titles, numbered 1-5, without any additional explanation or text.
    `);

        console.log(yourIntention, roadmapPrompt);

        const isRoadmapAvailable = await availaleRoadmapInDB(roadmapPrompt);

        if (Object.keys(isRoadmapAvailable).length !== 0) {
            // User query is already available in the database
            // Share the details of the roadmap with the user
            console.log(`Roadmap for ${roadmapPrompt} already exists in the database.`);
            // TODO: Share roadmap details with the 

            const returnJsonOjbect = {
                message: "Roadmap for " + roadmapPrompt + " already exists in the database.",
                roadmap: isRoadmapAvailable
            }

            return `${JSON.stringify(returnJsonOjbect)}` || "";
            // Ask the user if they still want to create a new roadmap
            // TODO: Implement user confirmation logic
        } else {
            // User query is not available in the database

            const chain = getTitlePrompt.pipe(groqModel).pipe(new StringOutputParser());

            const response = await chain.invoke({
                roadmapPrompt: roadmapPrompt,
                yourIntention: yourIntention
            });

            console.log('Response:', response);

        }
        return 'Roadmap title created successfully';
    } catch (error) {
        console.error('Error getting roadmap title:', error);
        return 'Failed to get roadmap title';
    }
};