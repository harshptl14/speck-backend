// lib/aiModels.ts

import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

require('dotenv').config();

const modelRegistry = {
    "groq:llama-3.3": () =>
        new ChatGroq({
            apiKey: process.env.GROQ_API_KEY!,
            model: "llama-3.3-70b-versatile",
        }),

    "groq:llama-3.2": () =>
        new ChatGroq({
            apiKey: process.env.GROQ_API_KEY!,
            model: "llama-2-70b-chat",
        }),

    "openai:gpt-4": () =>
        new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
            modelName: "gpt-4",
        }),

    "gemini:pro": () =>
        new ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY,
            model: "gemini-1.5-pro-latest",
        }),

    "gemini:flash": () =>
        new ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY,
            model: "gemini-2.0-flash-lite",
        }),
};

export const getModelById = (modelId: string) => {
    const modelFactory = modelRegistry[modelId];
    if (!modelFactory) {
        throw new Error(`Unsupported modelId: ${modelId}`);
    }
    return modelFactory();
};

export const modelTokenLimits: Record<string, number> = {
    "groq:llama-3.3": 6250,
    "gemini:flash": 8750,
    "gemini:pro": 32768,
    "openai:gpt-4": 128000,
};
