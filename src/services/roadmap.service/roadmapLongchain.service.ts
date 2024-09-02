import { groqModel } from "../../configs/longchain.config";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { availaleRoadmapInDB } from "./topicExist.service";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { insertJsonToPrisma } from "./llmToDB";
import { populateFirstRoadmapTopic } from "./contentScrap.service";

export const createRoadmapFunction = async (userQuery: string, userId: number): Promise<{} | Error> => {
  try {
    const roadmapPrompt = PromptTemplate.fromTemplate(`
Create a comprehensive learning roadmap for mastering {userQuery}. Your task includes topics and subtopics. Respond with a JSON object only, using the following structure:

{{
  "topics": [
    {{
      "name": "Topic Name",
      "description": "Brief description of the topic",
      "order": 1,
      "subtopics": [
        {{
          "name": "Subtopic Name",
          "description": "Brief description of the subtopic",
          "order": 1
        }}
      ]
    }}
  ]
}}

Important:
1. Provide only valid JSON in your response.
2. Do not include any text, comments, or explanations outside the JSON structure.
3. Do not use backticks, markdown formatting, or code blocks.
4. Ensure all JSON keys and values are properly quoted.
5. The response should start with '{{' and end with '}}'.
`);

    const markdownInfoPrompt = ChatPromptTemplate.fromTemplate(
      `Your task is to create a JSON object with two keys: "markdownRoadmap" and "courseInfo". Follow these instructions carefully:

1. For the "markdownRoadmap" key:
    - Use the content provided within {roadmap} brackets.
    You will have this type of content:
    {{
  "topics": [
    {{
      "name": "Topic Name",
      "description": "Brief description of the topic",
      "order": 1,
      "subtopics": [
        {{
          "name": "Subtopic Name",
          "description": "Brief description of the subtopic",
          "order": 1
        }}
      ]
    }}
  ]
}}

    - use topics and subtopics to create a Markdown-formatted roadmap.
    - use the "name" key as the topic name and the "subtopics" key as the subtopic name.
    - Add Description to the subtopics.
    - Do not include any additional information, use only the content provided within {roadmap} brackets.
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
    - Do not alter or add any content beyond what's given in the {roadmap}.
2. For the "courseInfo" key:
    - Provide a concise description of the course as a single string (not in Markdown format).
    - Include information about what the course covers and its objectives.

Important guidelines:

- Your entire response must be a single, valid JSON object.
- Do not include any text, comments, or explanations outside the JSON structure.
- Do not use backticks, code blocks, or any formatting beyond what's required for JSON.
- Ensure all JSON keys and values are correctly quoted.
- The response should begin with '{{' and end with '}}'.

Use this exact format for your response:
{{
"markdownRoadmap": "Your Markdown roadmap here",
"courseInfo": "Your course information here as a single string"
}}

Remember:

- Provide only valid JSON in your response.
- The content inside "markdownRoadmap" should be Markdown-formatted text.
- The content inside "courseInfo" should be a plain text string without Markdown formatting.
- Do not add any additional formatting or explanations outside the JSON object.`
    );

    const RoadmapInfoPrompt = ChatPromptTemplate.fromTemplate(
      `
       You are an expert course curator. Using the following {markdown} content as a reference, create a clear, descriptive overview of what the course roadmap entails. Present the information in a way that is easy to understand and organized
       into well-structured paragraphs. Ensure the overview is engaging and highlights the course's structure, objectives, and key benefits to the learners. The tone should be informative and approachable, with the length of the content ranging
       between 150-250 words, formatted into clear paragraphs for better readability.

       Output only the courseInfo description.
      `);

    const RoadmapNamePropmt = ChatPromptTemplate.fromTemplate(
      `
      You are an expert course curator. Based on {userQuery}, generate a compelling and concise name for the roadmap that captures the essence of the course or learning journey. 
      The name should be clear, engaging, and relevant to the topic, reflecting the core objective of the roadmap. Keep the name concise, typically within 3-6 words.
      
      Output only the name, without any additional text or formatting.
      `
    );

    const isRoadmapAvailable = await availaleRoadmapInDB(userQuery, userId);

    if (Object.keys(isRoadmapAvailable).length !== 0) {
      // User query is already available in the database
      // Share the details of the roadmap with the user
      console.log(`Roadmap for ${userQuery} already exists in the database.`);
      // TODO: Share roadmap details with the 

      const returnJsonOjbect = {
        message: "Roadmap for " + userQuery + " already exists in the database.",
        roadmap: isRoadmapAvailable
      }

      return returnJsonOjbect || {};
      // Ask the user if they still want to create a new roadmap
      // TODO: Implement user confirmation logic
    } else {
      // User query is not available in the database
      // Create a new roadmap
      // TODO: Implement roadmap creation logic

      const chain = roadmapPrompt.pipe(groqModel).pipe(new StringOutputParser());

      const response = await chain.invoke({
        userQuery: userQuery
      });

      // const combinedChain = RunnableSequence.from([
      //   {
      //     roadmap: chain,
      //     // language: new RunnablePassthrough()
      //   },
      //   markdownInfoPrompt,
      //   groqModel,
      //   new StringOutputParser()
      // ]);

      // const combinedResponse = await combinedChain.invoke({
      //   userQuery: userQuery
      // });

      console.log("Response:", response);

      const markdown = jsonToMarkdown(JSON.parse(response));
      const courseInfoChain = RoadmapInfoPrompt.pipe(groqModel).pipe(new StringOutputParser());

      const courseInfoResponse = await courseInfoChain.invoke({
        markdown: markdown
      });

      // create a object, which combines courseInfoResponse and markdown
      const combinedResponse = {
        markdownRoadmap: markdown,
        courseInfo: courseInfoResponse
      };

      const courseNameChain = RoadmapNamePropmt.pipe(groqModel).pipe(new StringOutputParser());

      const courseNameResponse = await courseNameChain.invoke({
        userQuery: userQuery
      });

      console.log("Combined Response:", combinedResponse);

      console.log("roadmap name, prompt", courseNameResponse);

      // Insert the JSON data into the database
      const roadmapid = await insertJsonToPrisma(
        JSON.parse(response),
        combinedResponse,
        userId,
        courseNameResponse
      );

      console.log("roadmap Created and inserted into the database, now getting content for the first topic");

      await populateFirstRoadmapTopic(roadmapid);

      return { message: "Roadmap Created Successfully" };

    }
  } catch (error) {
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