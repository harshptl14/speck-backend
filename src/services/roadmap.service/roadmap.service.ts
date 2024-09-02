// import openai from "../configs/openai.config";
import groq from "../../configs/groq.config";
import openai from "../../configs/openai.config";
import { populateFirstRoadmapTopic } from "./contentScrap.service";
import { insertJsonToPrisma } from "./llmToDB";
import { availaleRoadmapInDB } from "./topicExist.service";

// function that calls OpenAI API to get the response
export const createRoadmapService = async (userQuery: string, userId: number): Promise<{} | Error> => {
	// Openai response

	// try {
	// 	const response = await openai.chat.completions.create({
	// 		messages: [{ role: "user", content: prompt }],
	// 		model: "gpt-3.5-turbo",
	// 	});
	// 	console.log("Output:", response.choices[0].message.content);
	// 	return response.choices[0].message.content;
	// } catch (error) {
	// 	// Handle error here
	// 	console.error("Error occurred while calling OpenAI API:", error);
	// 	throw error;
	// }

	try {
		// Insert the JSON data into the database
		const isRoadmapAvailable = await availaleRoadmapInDB(userQuery, userId);

		if (Object.keys(isRoadmapAvailable).length !== 0) {
			console.log(`Roadmap for ${userQuery} already exists in the database.`);
			const returnJsonObject = {
				message: "Roadmap for " + userQuery + " already exists in the database.",
				roadmap: isRoadmapAvailable
			}
			return returnJsonObject || {};
		} else {
			const roadmapPrompt = `
Create a comprehensive learning roadmap for mastering ${userQuery}. Your task includes topics and subtopics. Respond with a JSON object only, using the following structure:

{
  "topics": [
    {
      "name": "Topic Name",
      "description": "Brief description of the topic",
      "order": 1,
      "subtopics": [
        {
          "name": "Subtopic Name",
          "description": "Brief description of the subtopic",
          "order": 1
        }
      ]
    }
  ]
}

Important:
1. Provide only valid JSON in your response.
2. Do not include any text, comments, or explanations outside the JSON structure.
3. Do not use backticks, markdown formatting, or code blocks.
4. Ensure all JSON keys and values are properly quoted.
5. The response should start with '{' and end with '}'.
`;

			const roadmapResponse = await openai.chat.completions.create({
				model: "gpt-4",
				messages: [{ role: "user", content: roadmapPrompt }],
			});

			console.log("Roadmap Response:", roadmapResponse.choices[0].message.content);

			const roadmapJson = JSON.parse(roadmapResponse.choices[0].message.content || "{}");

			const markdownInfoPrompt = `Your task is to create a JSON object with two keys: "markdownRoadmap" and "courseInfo". Follow these instructions carefully:

1. For the "markdownRoadmap" key:
    - Use the content provided within the following JSON:
    ${JSON.stringify(roadmapJson)}
    
    - Use topics and subtopics to create a Markdown-formatted roadmap.
    - Use the "name" key as the topic name and the "subtopics" key as the subtopic name.
    - Add Description to the subtopics.
    - Convert this content into the following Markdown format:
        
        "
        ---
        title: Give roadmap a title
        markmap:
          colorFreezeLevel: 2
        ---
        ## Topic Name
        1. Subtopic Name 1 (Description)
        2. Subtopic Name 2 (Description)
        3. Subtopic Name 3 (Description)
        4. Subtopic Name 4 (Description)
        5. Subtopic Name 5 (Description)
        "
        
    - Each topic should be a heading (using #), followed by a numbered list of 3-5 subtopics.
    - Do not include descriptions or any additional information.
    - Do not alter or add any content beyond what's given in the JSON.
2. For the "courseInfo" key:
    - Provide a concise description of the course as a single string (not in Markdown format).
    - Include information about what the course covers and its objectives.

Important guidelines:

- Your entire response must be a single, valid JSON object.
- Do not include any text, comments, or explanations outside the JSON structure.
- Do not use backticks, code blocks, or any formatting beyond what's required for JSON.
- Ensure all JSON keys and values are correctly quoted.
- The response should begin with '{' and end with '}'.

Use this exact format for your response:
{
"markdownRoadmap": "Your Markdown roadmap here",
"courseInfo": "Your course information here as a single string"
}

Remember:

- Provide only valid JSON in your response.
- The content inside "markdownRoadmap" should be Markdown-formatted text.
- The content inside "courseInfo" should be a plain text string without Markdown formatting.
- Do not add any additional formatting or explanations outside the JSON object.`;

			const markdown = jsonToMarkdown(roadmapJson);
			console.log("Markdown:", markdown);
			const markdownInfoResponse = await openai.chat.completions.create({
				model: "gpt-4",
				messages: [{ role: "user", content: markdownInfoPrompt }],
			});

			const combinedResponse = JSON.parse(markdownInfoResponse.choices[0].message.content || "{}");

			console.log("Roadmap JSON:", roadmapJson);
			console.log("Combined Response:", combinedResponse);

			const roadmapId = await insertJsonToPrisma(
				roadmapJson,
				combinedResponse,
				userId,
				userQuery
			);

			console.log("Roadmap created and inserted into the database, now getting content for the first topic");

			await populateFirstRoadmapTopic(roadmapId);

		} return { message: "Roadmap Created Successfully" };
	}

	catch (error) {
		// Handle error here
		console.error("An error occurred in roadmapLangChain:", error);
		throw new Error("An error occurred while creating the roadmap");
	}
};

type subtopics = {
	name: string;
	description: string;
	order: number;
};

type topics = {
	name: string;
	description: string;
	order: number;
	subtopics: subtopics[];
};

function jsonToMarkdown(json: { topics: topics[] }) {
	let markdown = '';

	const parseTopics = (topics: topics[]) => {
		topics.forEach(topic => {
			markdown += `# ${topic.name}\n\n`;  // Topic name as a header
			if (topic.subtopics && topic.subtopics.length > 0) {
				topic.subtopics.forEach(subtopic => {
					markdown += `- ${subtopic.name} (${subtopic.description})\n`;  // Subtopic with description in parentheses
				});
			}
			markdown += `\n`;
		});
	};

	if (json.topics && json.topics.length > 0) {
		parseTopics(json.topics);
	}

	return markdown;
}


