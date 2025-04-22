import { PrismaClient } from '@prisma/client';
import { groqModel } from '../../configs/longchain.config';
import { PromptTemplate } from "@langchain/core/prompts";
import { ApiError } from '../../../utils/ApiError';
import { getModelById } from "../../configs/aiModels";
import { estimateTokenCount } from '../../../utils/tokenUtils';
import { modelTokenLimits } from '../../configs/aiModels';
import { Runnable } from "@langchain/core/runnables";

const prisma = new PrismaClient();

interface MindmapResponse {
    title: string;
    markdown: string;
}
// Prompt for structuring messy text
// const structurePrompt = PromptTemplate.fromTemplate(`
// Convert the following messy text into a clean, hierarchical Markdown format suitable for a Markmap mind map and parseable into a roadmap with topics and subtopics. Use # for the main title, ## for topic names, and - for subtopics or details. Ensure clarity and logical organization.

// Messy Text:
// {inputText}

// Return the structured Markdown content only.
// `);

const structurePrompt = PromptTemplate.fromTemplate(`
Convert the following messy text into a clean, hierarchical Markdown format suitable for a Markmap mind map and parseable into a roadmap with topics and subtopics.

First, identify a concise, descriptive title for the overall content if none is provided.

Messy Text:
{inputText}

Respond in JSON format:
{{
  "title": "Your identified title here",
  "markdown": "# Your identified title here\\n## Topic 1\\n- Subtopic 1.1\\n- Subtopic 1.2\\n## Topic 2\\n- Subtopic 2.1"
}}
`);

// Prompt for updating Markdown based on user's natural language instruction
const updatePrompt = PromptTemplate.fromTemplate(`
You are a helpful assistant that can explain and modify markdown mindmap content. The mindmap uses a hierarchical format (#, ##, -) to organize topics and subtopics.

Here's the current Markdown structure:
{markdownText}

User instruction: "{userPrompt}"

If the user is asking to modify, update, or create mindmap content:
1. Make the requested changes to the markdown
2. Provide a brief explanation of what you changed
3. Format your response as follows:

<response>
<explanation>
[Your explanation of what you changed and why]
</explanation>

<markdown>
[The complete updated markdown content]
</markdown>
</response>

If the user is asking a question about the mindmap or making a request that doesn't involve modifying the mindmap:
1. Answer their question or respond to their request normally
2. Format your response as follows:

<response>
<plaintext>
[Your answer or response here]
</plaintext>
</response>

Always maintain the hierarchical format (#, ##, -) in markdown content for consistency.
`);

// Function to directly update markdown content only (no AI processing)
export const directUpdateMarkdown = async (
    mindmapId: number,
    userId: number,
    markdownText: string
): Promise<string> => {
    try {
        // Fetch mindmap to verify ownership
        const mindmap = await prisma.mindmap.findFirst({
            where: { id: mindmapId, userId },
        });

        if (!mindmap) {
            throw ApiError(404, 'Mindmap not found or not authorized');
        }

        // Update mindmap with direct markdown
        await prisma.mindmap.update({
            where: { id: mindmapId },
            data: { markdown: markdownText },
        });

        return markdownText;
    } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error; // Re-throw ApiError
        }
        throw ApiError(500, 'Failed to update mindmap');
    }
};

// Function to generate AI suggestions based on current markdown and user prompt
export const generateAISuggestion = async (
    mindmapId: number,
    userId: number,
    userPrompt: string,
    modelId: string = "groq:llama-3.3"
): Promise<{ originalMarkdown: string; suggestedMarkdown: string }> => {
    try {
        const mindmap = await prisma.mindmap.findFirst({
            where: { id: mindmapId, userId },
        });

        if (!mindmap) throw ApiError(404, "Mindmap not found or not authorized");

        const fullText = `${userPrompt}\n\n${mindmap.markdown}`;
        const estimatedTokens = estimateTokenCount(fullText);
        const tokenLimit = modelTokenLimits[modelId] || 8192;

        if (estimatedTokens > tokenLimit) {
            throw ApiError(400, `Input exceeds token limit for model ${modelId}. Estimated ${estimatedTokens} tokens, limit is ${tokenLimit}.`);
        }

        const prompt = await updatePrompt.format({
            userPrompt,
            markdownText: mindmap.markdown,
        });

        const model = getModelById(modelId);
        const response = await model.invoke(prompt);
        const suggestedMarkdown = response.content as string;

        return {
            originalMarkdown: mindmap.markdown,
            suggestedMarkdown,
        };
    } catch (error) {
        console.error("Suggestion generation error:", error);
        throw ApiError(500, "Failed to generate AI suggestion");
    }
};


// Function to accept AI suggestion and save to database
export const acceptAISuggestion = async (
    mindmapId: number,
    userId: number,
    suggestedMarkdown: string
): Promise<string> => {
    try {
        // Verify ownership
        const mindmap = await prisma.mindmap.findFirst({
            where: { id: mindmapId, userId },
        });

        if (!mindmap) {
            throw ApiError(404, 'Mindmap not found or not authorized');
        }

        // Update mindmap with accepted suggestion
        await prisma.mindmap.update({
            where: { id: mindmapId },
            data: { markdown: suggestedMarkdown },
        });

        return suggestedMarkdown;
    } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error; // Re-throw ApiError
        }
        throw ApiError(500, 'Failed to accept AI suggestion');
    }
};

// Save an AI chat message
export const saveAIChatMessage = async (
    mindmapId: number,
    userId: number,
    role: 'user' | 'assistant',
    content: string
): Promise<void> => {
    try {
        // Verify mindmap ownership
        const mindmap = await prisma.mindmap.findFirst({
            where: { id: mindmapId, userId },
        });

        if (!mindmap) {
            throw ApiError(404, 'Mindmap not found or not authorized');
        }

        await prisma.aIChatMessage.create({
            data: {
                mindmapId,
                role,
                content,
            },
        });
    } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        throw ApiError(500, 'Failed to save AI chat message');
    }
};

// Retrieve AI chat messages for a mindmap
export const getAIChatMessages = async (
    mindmapId: number,
    userId: number
): Promise<{ id: number; role: string; content: string; createdAt: Date }[]> => {
    try {
        // Verify mindmap ownership
        const mindmap = await prisma.mindmap.findFirst({
            where: { id: mindmapId, userId },
        });

        if (!mindmap) {
            throw ApiError(404, 'Mindmap not found or not authorized');
        }

        const messages = await prisma.aIChatMessage.findMany({
            where: { mindmapId },
            select: {
                id: true,
                role: true,
                content: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        return messages;
    } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        throw ApiError(500, 'Failed to fetch AI chat messages');
    }
};

export const createMindmap = async (
    userId: number,
    inputText: string,
    providedTitle?: string,
    modelId: string = "groq:llama-3.3"
): Promise<{ markdown: string; id: number; title: string }> => {
    try {
        // Robust validation of inputText
        if (typeof inputText !== 'string' || !inputText.trim()) {
            throw ApiError(400, `Invalid input text: must be a non-empty string, received ${typeof inputText}`);
        }

        const estimatedTokens = estimateTokenCount(inputText);
        const tokenLimit = modelTokenLimits[modelId] || 8192;

        if (estimatedTokens > tokenLimit) {
            throw ApiError(400, `Input is too long for model ${modelId}. Estimated ${estimatedTokens} tokens, but limit is ${tokenLimit}.`);
        }

        // Log inputText for debugging
        console.log("Creating mindmap with inputText:", {
            inputText,
            inputTextLength: inputText.length,
            modelId,
            userId,
        });

        // Format the prompt
        const prompt = await structurePrompt.format({ inputText });
        console.log("Formatted prompt:", prompt); // Log the formatted prompt

        const model = getModelById(modelId);
        const response = await model.invoke(prompt, {
            response_format: { type: "json_object" },
        });

        let parsedResponse: MindmapResponse;
        let title: string;
        let markdown: string;

        try {
            parsedResponse = JSON.parse(response.content as string);
            if (!parsedResponse.title || !parsedResponse.markdown) {
                throw new Error("Invalid response: missing title or markdown");
            }
            title = providedTitle || parsedResponse.title;
            markdown = parsedResponse.markdown;
        } catch (parseError) {
            console.error("Response parsing error:", parseError, { content: response.content });
            const content = response.content as string;
            const titleMatch = content.match(/"title":\s*"([^"]+)"/);
            const markdownMatch = content.match(/"markdown":\s*"([^"]+)"/);
            title = providedTitle || titleMatch?.[1] || "Untitled Mindmap";
            markdown = markdownMatch?.[1]?.replace(/\\n/g, "\n") || "Default markdown";
        }

        const mindmap = await prisma.mindmap.create({
            data: { title, markdown, userId, originalText: inputText },
        });

        return { markdown, id: mindmap.id, title };
    } catch (error: any) {
        console.error("Mindmap creation error:", {
            message: error.message,
            stack: error.stack,
            userId,
            modelId,
            inputTextLength: inputText?.length || 0,
            inputText: inputText || "undefined",
        });
        throw ApiError(500, `Failed to create mindmap: ${error.message}`);
    }
};

// export const createMindmap = async (
//     userId: number,
//     inputText: string,
//     providedTitle?: string,
//     modelId: string = "groq:llama-3.3"
// ): Promise<{ markdown: string; id: number; title: string }> => {
//     try {
//         const estimatedTokens = estimateTokenCount(inputText);
//         const tokenLimit = modelTokenLimits[modelId] || 8192;

//         if (estimatedTokens > tokenLimit) {
//             throw ApiError(400, `Input is too long for model ${modelId}. Estimated ${estimatedTokens} tokens, but limit is ${tokenLimit}.`);
//         }

//         const prompt = await structurePrompt.format({ inputText });
//         const model = getModelById(modelId);

//         const response = await model.invoke(prompt, {
//             response_format: { type: "json_object" },
//         });

//         let parsedResponse: MindmapResponse;
//         let title: string;
//         let markdown: string;

//         try {
//             parsedResponse = JSON.parse(response.content as string);
//             title = providedTitle || parsedResponse.title;
//             markdown = parsedResponse.markdown;
//         } catch {
//             const content = response.content as string;
//             const titleMatch = content.match(/"title":\s*"([^"]+)"/);
//             const markdownMatch = content.match(/"markdown":\s*"([^"]+)"/);
//             title = providedTitle || titleMatch?.[1] || "Untitled Mindmap";
//             markdown = markdownMatch?.[1]?.replace(/\\n/g, "\n") || content;
//         }

//         const mindmap = await prisma.mindmap.create({
//             data: { title, markdown, userId, originalText: inputText },
//         });

//         return { markdown, id: mindmap.id, title };
//     } catch (error) {
//         console.error("Mindmap creation error:", error);
//         throw ApiError(500, "Failed to create mindmap");
//     }
// };

export const getMindmap = async (
    mindmapId: number,
    userId: number
): Promise<{ title: string; markdown: string }> => {
    try {
        const mindmap = await prisma.mindmap.findFirst({
            where: { id: mindmapId, userId },
            select: { title: true, markdown: true, originalText: true },
        });

        if (!mindmap) {
            throw ApiError(404, 'Mindmap not found or not authorized');
        }

        return mindmap;
    } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error; // Re-throw ApiError
        }
        throw ApiError(500, 'Failed to fetch mindmap');
    }
};

export const listMindmaps = async (
    userId: number
): Promise<{ id: number; title: string; createdAt: Date }[]> => {
    try {
        const mindmaps = await prisma.mindmap.findMany({
            where: { userId },
            select: { id: true, title: true, createdAt: true, updatedAt: true, originalText: true, markdown: true },
        });

        return mindmaps;
    } catch (error) {
        throw ApiError(500, 'Failed to fetch mindmaps');
    }
};