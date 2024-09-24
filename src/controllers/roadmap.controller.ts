import { Request, Response } from 'express';
import { createRoadmapService } from '../services/roadmap.service/roadmap.service';
import { createRoadmapFunction } from '../services/roadmap.service/roadmapLongchain.service';
import { getRoadmapTitleService } from '../services/roadmap.service/getRoadmapTitle.service';
import { getRoadmapByIdService, getUserRoadmaps, getTopicsByIdService, getSubTopicByIdService, getRoadmapsInfoByUserIdService } from '../services/roadmap.service/userRoadmaps.service';
import { createRoadmapSchema, getRoadmapByIdSchema, getRoadmapTitleSchema, getRoadmapOutlineSchema, getRoadmapsInfoByUserIdSchema } from '../models/roadmapSchemas';

interface User {
    id: number;
    email: string;
    name: string,
    createdAt: Date,
    updatedAt: Date,
}

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


export const getRoadmapsInfoByUserId = async (req: Request, res: Response) => {
    const validationResult = getRoadmapsInfoByUserIdSchema.safeParse(req.params);
    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
    }

    const userId = Number(req.params.id);
    try {
        const roadmapsInfo = await getRoadmapsInfoByUserIdService(userId);
        res.status(200).json({
            message: 'Roadmaps info retrieved successfully',
            data: roadmapsInfo,
        });
    } catch (error) {
        res.status(500).json({
            message: `Failed to get Roadmaps info, ${error}`,
            error: error,
        });
    }
};
