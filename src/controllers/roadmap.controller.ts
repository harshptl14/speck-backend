import { Request, Response } from 'express';
import { getResponse } from '../services/roadmap.service/roadmap.service';
import { createRoadmapFunction } from '../services/roadmap.service/roadmapLongchain.service';
import { getRoadmapTitleService } from '../services/roadmap.service/getRoadmapTitle.service';
import { getUserRoadmaps } from '../services/roadmap.service/userRoadmaps.service';

export const createRoadmap = async (req: Request, res: Response) => {
    try {
        const roadmap = await createRoadmapFunction(req.body.prompt);
        res.status(201).json({
            message: roadmap,
        });
    } catch (error) {
        console.error('Error creating roadmap:', error);
        res.status(500).json({
            message: 'Failed to create roadmap',
        });
    }
};

export const getMyRoadmaps = async (req: Request, res: Response) => {
    try {

        const roadmaps = await getUserRoadmaps(req.body.userId);

        res.status(200).json({
            message: 'Roadmap retrieved successfully',
            roadmaps: roadmaps,
        });
    } catch (error) {
        res.status(500).json({
            message: `Failed to get roadmap, ${error}`,
            error: error, // Add the error message to the response
        });
    }
};

export const getRoadmapTitle = async (req: Request, res: Response) => {
    try {
        const response = await getRoadmapTitleService(req.body.yourIntention, req.body.roadmapPrompt);
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
    try {
        const response = await getResponse(req.body.roadmapPrompt);
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