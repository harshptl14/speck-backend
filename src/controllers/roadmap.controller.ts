import { Request, Response } from 'express';
import { createRoadmapService } from '../services/roadmap.service/roadmap.service';
import { createRoadmapFunction } from '../services/roadmap.service/roadmapLongchain.service';
import { getRoadmapTitleService } from '../services/roadmap.service/getRoadmapTitle.service';
import { getRoadmapByIdService, getUserRoadmaps, getTopicsByIdService, getSubTopicByIdService, updateSubtopicCompletionService } from '../services/roadmap.service/userRoadmaps.service';
import { createRoadmapSchema, createSubtopicContentSchema, getRoadmapByIdSchema, getRoadmapTitleSchema, getRoadmapOutlineSchema, updateSubtopicCompletionSchema } from '../models/roadmapSchemas';
import { createSubtopicContentService } from '../services/roadmap.service/contentScrap.service';
import { redisClient } from '../../utils/client';

interface User {
    id: number;
    email: string;
    name: string,
    createdAt: Date,
    updatedAt: Date,
}
// Write Controllers
export const createRoadmap = async (req: Request, res: Response) => {
    const user = req?.user as User;

    const validationResult = createRoadmapSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
    }

    try {
        const response = await createRoadmapFunction(req.body.prompt, user.id);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error creating roadmap:', error);
        res.status(500).json({
            message: 'Failed to create roadmap',
        });
    }
};

export const createSubtopicContent = async (req: Request, res: Response) => {
    const validationResult = createSubtopicContentSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
    }

    console.log('req.body', req.body);


    const subtopicId = Number(req.body.subtopicId);
    const roadmapId = Number(req.body.roadmapId)
    const jobId = req.body.jobId;

    console.log('roadmapId', subtopicId);

    try {
        const response = await createSubtopicContentService(subtopicId, roadmapId, jobId);
        res.status(200).json({
            message: response,
        });
    } catch (error) {
        console.error('Error getting response:', error);
        res.status(500).json({
            message: 'Failed to get response',
        });
    }
}

export const getSubtopicGenerationProgress = async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const progress = await redisClient.get(`progress:${jobId}`);
    if (progress) {
        res.json({ progress: parseInt(progress) });
    } else {
        res.status(404).json({ message: 'Progress not found' });
    }
}

export const getMyRoadmaps = async (req: Request, res: Response) => {
    try {
        const user = req?.user as User;
        const roadmaps = await getUserRoadmaps(user.id);

        res.status(200).json({
            message: 'Roadmap retrieved successfully',
            roadmaps: roadmaps,
        });
    } catch (error) {
        res.status(500).json({
            message: `Failed to get roadmap, ${error}`,
            error: error,
        });
    }
};

// Read Controllers
export const getRoadmapById = async (req: Request, res: Response) => {
    const validationResult = getRoadmapByIdSchema.safeParse(req.params);
    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
    }

    const roadmapId = Number(req.params.id);
    try {
        const roadmap = await getRoadmapByIdService(roadmapId);
        res.status(200).json({
            message: 'Roadmap retrieved successfully',
            data: roadmap,
        });
    } catch (error) {
        res.status(500).json({
            message: `Failed to get roadmap, ${error}`,
            error: error,
        });
    }
};

export const getTopicsById = async (req: Request, res: Response) => {
    const validationResult = getRoadmapByIdSchema.safeParse(req.params);
    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
    }

    const roadmapId = Number(req.params.id);
    try {
        const topics = await getTopicsByIdService(roadmapId);
        res.status(200).json({
            message: 'Topic retrieved successfully',
            data: topics,
        });
    } catch (error) {
        res.status(500).json({
            message: `Failed to get topics, ${error}`,
            error: error,
        });
    }
};

export const getSubTopicById = async (req: Request, res: Response) => {
    const validationResult = getRoadmapByIdSchema.safeParse(req.params);
    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
    }

    const roadmapId = Number(req.params.id);
    try {
        const topics = await getSubTopicByIdService(roadmapId);
        res.status(200).json({
            message: 'Topic retrieved successfully',
            data: topics,
        });
    } catch (error) {
        res.status(500).json({
            message: `Failed to get topics, ${error}`,
            error: error,
        });
    }
};

export const getRoadmapTitle = async (req: Request, res: Response) => {
    const validationResult = getRoadmapTitleSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
    }

    try {
        const user = req?.user as User;
        const response = await getRoadmapTitleService(req.body.yourIntention, req.body.roadmapPrompt, user.id);
        res.status(200).json({
            message: response,
        });
    } catch (error) {
        console.error('Error getting response:', error);
        res.status(500).json({
            message: 'Failed to get response',
        });
    }
}

export const getRoadmapOutline = async (req: Request, res: Response) => {
    const validationResult = getRoadmapOutlineSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
    }

    try {
        const user = req?.user as User;
        const response = await createRoadmapService(req.body.prompt, user.id);
        res.status(200).json({
            message: response,
        });
    } catch (error) {
        console.error('Error getting response:', error);
        res.status(500).json({
            message: 'Failed to get response',
        });
    }
}


export const updateSubtopicCompletion = async (req: Request, res: Response) => {
    const validationResult = updateSubtopicCompletionSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
    }

    const { topicId, subtopicId, newStatus, roadmapId } = req.body;
    try {
        const user = req?.user as User;
        const response = await updateSubtopicCompletionService(roadmapId, topicId, subtopicId, newStatus, user.id);
        res.status(200).json({
            message: 'Subtopic completion status updated successfully',
            data: response,
        });
    } catch (error) {
        console.error('Error updating subtopic completion:', error);
        res.status(500).json({
            message: 'Failed to update subtopic completion',
            error: error,
        });
    }
};