// src/controllers/favorite.controller.ts
import { Response, Request, NextFunction } from 'express';
import { ApiError } from '../../utils/ApiError';
import * as favoriteService from '../services/roadmap.service/favorite.service';

interface User {
    id: number;
    email: string;
    name: string,
    createdAt: Date,
    updatedAt: Date,
}

export const createFavorite = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = req?.user as User;
        const roadmapId = parseInt(req.params.roadmapId);

        if (isNaN(roadmapId)) {
            throw ApiError(400, 'Invalid roadmap ID');
        }

        const favorite = await favoriteService.createFavorite({
            userId: user?.id,
            roadmapId,
        });

        res.status(201).json({
            success: true,
            message: 'Roadmap added to favorites',
            favorite,
        });
    } catch (error) {
        next(error);
    }
};

export const removeFavorite = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = req?.user as User;
        const userId = user?.id;
        const roadmapId = parseInt(req.params.roadmapId);

        if (isNaN(roadmapId)) {
            throw ApiError(400, 'Invalid roadmap ID');
        }

        await favoriteService.removeFavorite({
            userId,
            roadmapId,
        });

        res.status(200).json({
            success: true,
            message: 'Roadmap removed from favorites',
        });
    } catch (error) {
        next(error);
    }
};

export const getUserFavorites = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = req?.user as User;
        const userId = user?.id;
        const favorites = await favoriteService.getUserFavorites(userId);

        res.status(200).json({
            success: true,
            favorites,
        });
    } catch (error) {
        next(error);
    }
};