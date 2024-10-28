import { z } from 'zod';

export const createRoadmapSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
});

export const createSubtopicContentSchema = z.object({
    roadmapId: z.string().min(1, "Topic ID is required"),
    subtopicId: z.string().min(1, "Subtopic ID is required"),
    jobId: z.string().min(1, "jobId is required"),
});

export const getRoadmapByIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
});

export const getRoadmapTitleSchema = z.object({
    yourIntention: z.string().min(1, "Intention is required"),
    roadmapPrompt: z.string().min(1, "Roadmap prompt is required"),
});

export const getRoadmapOutlineSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
});

export const getRoadmapsInfoByUserIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
});

export const updateSubtopicCompletionSchema = z.object({
    roadmapId: z.number().min(1, "Roadmap ID is required"),
    topicId: z.number().min(1, "Topic ID is required"),
    subtopicId: z.number().min(1, "Subtopic ID is required"),
    newStatus: z.string().min(1, "New status is required"),
});

export const resetRoadmapProgressSchema = z.object({
    roadmapId: z.string(),
});
