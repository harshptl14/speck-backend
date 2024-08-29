import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";

require('dotenv').config();

export const groqModel = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.1-70b-versatile",
});

// export const openaiModel = new ChatOpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     model: "gpt-3.5-turbo-1106",
// });

