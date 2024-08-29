import { groqModel } from "../../configs/longchain.config";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { availaleRoadmapInDB } from "./topicExist.service";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { insertJsonToPrisma } from "./llmToDB";
import { populateFirstRoadmapTopic } from "./contentScrap.service";

export const createRoadmapFunction = async (userQuery: string): Promise<string> => {
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
      `You need to do two things and put them in a JSON format with two keys: markdownRoadmap and courseInfo. Your response must be a complete, valid JSON object without any additional text, markdown formatting, or code blocks. Do not use backticks or any other formatting outside the JSON structure.

1. For markdownRoadmap key: Use only the provided {roadmap}, and convert it into Markdown format. Don't change or add content by yourself.

2. For courseInfo key: Provide information about this course in Markdown format. Make it descriptive and informative about what the course is about and what it will cover.

Your response must be a single, complete JSON object in this exact format:
{{
  "markdownRoadmap": "Your markdown roadmap here",
  "courseInfo": "Your course information here"
}}

Important: 
1. Provide only valid JSON in your response.
2. Do not include any text, comments, or explanations outside the JSON structure.
3. Do not use backticks, markdown formatting, or code blocks.
4. Ensure all JSON keys and values are properly quoted.
5. The response should start with '{{' and end with '}}'.`
    );

    const isRoadmapAvailable = await availaleRoadmapInDB(userQuery);

    if (Object.keys(isRoadmapAvailable).length !== 0) {
      // User query is already available in the database
      // Share the details of the roadmap with the user
      console.log(`Roadmap for ${userQuery} already exists in the database.`);
      // TODO: Share roadmap details with the 

      const returnJsonOjbect = {
        message: "Roadmap for " + userQuery + " already exists in the database.",
        roadmap: isRoadmapAvailable
      }

      return `${JSON.stringify(returnJsonOjbect)}` || "";
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

      const combinedChain = RunnableSequence.from([
        {
          roadmap: chain,
          // language: new RunnablePassthrough()
        },
        markdownInfoPrompt,
        groqModel,
        new StringOutputParser()
      ]);

      const combinedResponse = await combinedChain.invoke({
        userQuery: userQuery
      });

      console.log("Response:", response);

      console.log("Combined Response:", combinedResponse);

      // let passedRoadmapRes = "";
      // let passedRoadmapMetadata = "";
      // try {
      //   // Remove any potential leading/trailing whitespace or non-JSON characters
      //   const cleanedResult = response.trim().replace(/^[^{]*/, '').replace(/[^}]*$/, '');

      //   // Remove any invisible characters and escape newlines
      //   const sanitizedResult = cleanedResult
      //     .replace(/[\u0000-\u001F]+/g, '')
      //     .replace(/\n/g, '\\n')
      //     .replace(/\r/g, '\\r')
      //     .replace(/\t/g, '\\t');

      //   passedRoadmapRes = JSON.parse(sanitizedResult);
      // } catch (error) {
      //   console.error("Failed to parse JSON response:", response);
      //   throw new Error("Invalid response format from language model");
      // }

      // try {
      //   // Remove any potential leading/trailing whitespace or non-JSON characters
      //   const cleanedResult = combinedResponse.trim().replace(/^[^{]*/, '').replace(/[^}]*$/, '');

      //   // Remove any invisible characters and escape newlines
      //   const sanitizedResult = cleanedResult
      //     .replace(/[\u0000-\u001F]+/g, '')
      //     .replace(/\n/g, '\\n')
      //     .replace(/\r/g, '\\r')
      //     .replace(/\t/g, '\\t');

      //   passedRoadmapMetadata = JSON.parse(sanitizedResult);
      // } catch (error) {
      //   console.error("Failed to parse JSON response:", response);
      //   throw new Error("Invalid response format from language model");
      // }

      // console.log("Roadmap:", passedRoadmapRes);
      // console.log("Metadata:", passedRoadmapMetadata);

      // Insert the JSON data into the database
      const roadmapid = await insertJsonToPrisma(
        JSON.parse(response),
        JSON.parse(combinedResponse),
        1,
        userQuery
      );

      // Use the JSON data, and collect and store the content for first 1 object in the DB

      // Function to extract the first object from the JSON data

      // loop through that first object and find contnet

      // Do processing on the content(transcribe and creating course contnet for each topic and subtopic using LLM)

      // Store the content in the DB

      console.log("roadmap Created and inserted into the database, now getting content for the first topic");

      await populateFirstRoadmapTopic(roadmapid);

      return JSON.stringify(response) || "";

    }
  } catch (error) {
    console.error("An error occurred in roadmapLangChain:", error);
    return "";
  }
};