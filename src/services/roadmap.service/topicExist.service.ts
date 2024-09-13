// TODO:
/*
    1. take user input
    2. create a database instance
    3. parse the uesr input in the prompt, and call LLM using that prompt
    4. Guess 5 things that user might actually want to learn using the user input
    5. Query the database to check if the topic already exists
    6. If the topic exists, return true
    7. If the topic does not exist, return false
*/

import { groqModel } from "../../configs/longchain.config";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import prisma from "../../../utils/client";

const similarTopics = async (userQuery: string, commaSeperatedUserRoadmaps: string | null): Promise<string> => {
    const SYSTEM_PROMPT = `You are a expert in finding similar things. Given the user query, and the roadmaps that are already present in the database, you need to tell me whether that query/roadmap is already in the dabase or not. I will provide you with the roadmap name and the id of the roadmap. If you find the similar roadmap based on the user query which is already present in the string that I will give you, you need to return JSON object with the roadmap name and the id of the roadmap. If you don't find the roadmap, you need to return an empty JSON object. Please frovide the JSON object only NO Other thing. HERE IS THE STRING: {commaSeperatedUserRoadmaps}, if {commaSeperatedUserRoadmaps}`;

    const USER_PROMPT = `Here's the user query: {userQuery} \n\n Please find wether this roadmap is already present in the database or not. If it is present, return the JSON with roadmap name and the id of the roadmap. If it is not present, return empty JSON. ONLY JSON OBJECT. NO OTHER THING.`;

    try {
        if (commaSeperatedUserRoadmaps === "") {
            console.error("User Roadmaps not available");
            return "[]";
        } else {
            console.log("---finding similear topics---")
            const prompt = ChatPromptTemplate.fromMessages([
                ["system", SYSTEM_PROMPT],
                ["human", USER_PROMPT],
            ]);

            const chain = prompt.pipe(groqModel);
            const response = await chain.invoke({
                userQuery,
                commaSeperatedUserRoadmaps
            });

            console.log("Response from the model:", response?.content);
            console.log("type: ", typeof (response?.content));
            const simTopics = response?.content as string;
            return simTopics;
        }
    } catch (error) {
        console.error("An error occurred in topic exist, similar topic fun:", error);
        return "";
    }
};

export const userRoadmaps = async (userID: number): Promise<string | null> => {
    try {
        const roadmaps = await prisma.roadmap.findMany({
            where: {
                userId: userID,
            }
        })

        console.log("Roadmaps:", roadmaps);
        let stringRoadmaps = "";
        for (const roadmap of roadmaps) {
            console.log("Roadmap:", roadmap.name);
            // create a comma separated string of all the roadmaps
            stringRoadmaps = stringRoadmaps + ", " + `[ ${roadmap.name} , ${roadmap.id} ]`;
        }

        console.log("String Roadmaps:", stringRoadmaps);
        return stringRoadmaps || "";
    }
    catch (error) {
        console.error("An error occurred in topicExist, userRoadmap function:", error);
        return null;
    }
}

type RoadmapExistResponse = {
    name: string;
    id: number;
} | {};

export const availaleRoadmapInDB = async (userQuery: string, userId: number): Promise<RoadmapExistResponse> => {
    try {
        const commaSeperatedUserRoadmaps = await userRoadmaps(userId);
        const similarRoadmap = await similarTopics(userQuery, commaSeperatedUserRoadmaps);

        const existRoadmap: RoadmapExistResponse = JSON.parse(similarRoadmap);
        return existRoadmap;
    } catch (error) {
        console.error("An error occurred topic exist, availableRoadmapInDB:", error);
        return false;
    }
}
