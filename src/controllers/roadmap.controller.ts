import { Request, Response } from 'express';
import { getResponse } from '../services/roadmap.service';

export const createRoadmap = async (req: Request, res: Response) => {
    try {
        // Your code to create a roadmap goes here
        const roadmap = await getResponse(req.body.prompt);
        res.status(201).json({
            message: 'Roadmap created successfully:' + roadmap,
        });
    } catch (error) {
        console.error('Error creating roadmap:', error);
        res.status(500).json({
            message: 'Failed to create roadmap',
        });
    }
};

export const getRoadmap = async (req: Request, res: Response) => {
    try {
        // Your code to get a roadmap goes here
        res.status(200).json({
            message: 'Roadmap retrieved successfully',
        });
    } catch (error) {
        console.error('Error getting roadmap:', error);
        res.status(500).json({
            message: 'Failed to get roadmap',
        });
    }
};