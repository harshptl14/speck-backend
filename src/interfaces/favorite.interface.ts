export interface IFavorite {
    id: number;
    userId: number;
    roadmapId: number;
    createdAt: Date;
}

export interface CreateFavoriteDto {
    userId: number;
    roadmapId: number;
}

export interface FavoriteResponse {
    success: boolean;
    message: string;
    favorite?: IFavorite;
}