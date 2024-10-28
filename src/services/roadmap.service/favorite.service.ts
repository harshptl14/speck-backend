import { Favorite } from '@prisma/client';
import { prisma } from '../../../utils/client';
import { CreateFavoriteDto, IFavorite } from '../../interfaces/favorite.interface';
import { ApiError } from '../../../utils/ApiError';

export const createFavorite = async (data: CreateFavoriteDto): Promise<IFavorite> => {
    try {
        const roadmap = await prisma.roadmap.findUnique({
            where: { id: data.roadmapId },
        });

        if (!roadmap) {
            throw ApiError(404, 'Roadmap not found');
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId: data.userId,
                roadmapId: data.roadmapId,
            },
        });

        return favorite;
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw ApiError(409, 'Roadmap already in favorites');
        }
        throw error;
    }
};

export const removeFavorite = async (data: CreateFavoriteDto): Promise<void> => {
    try {
        await prisma.favorite.delete({
            where: {
                userId_roadmapId: {
                    userId: data.userId,
                    roadmapId: data.roadmapId,
                },
            },
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            throw ApiError(404, 'Roadmap not found in favorites');
        }
        throw error;
    }
};

export const getUserFavorites = async (userId: number): Promise<Favorite[]> => {
    return prisma.favorite.findMany({
        where: { userId },
        include: {
            roadmap: true,
        },
    });
};
