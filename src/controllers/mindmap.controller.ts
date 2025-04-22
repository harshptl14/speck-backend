import { Request, Response, NextFunction } from 'express';
import {
    createMindmap,
    directUpdateMarkdown,
    generateAISuggestion,
    acceptAISuggestion,
    getMindmap,
    listMindmaps,
    saveAIChatMessage,
    getAIChatMessages
} from '../services/mindmap.service/mindmap.service';
import { ApiError } from '../../utils/ApiError';

interface User {
    id: number;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export const createMindmapController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { inputText, title, modelId } = req.body;
        const user = req.user as User;

        if (!user?.id) throw ApiError(401, 'Unauthorized');
        if (!inputText) throw ApiError(400, 'Input text is required');

        const { markdown, id, title: finalTitle } = await createMindmap(user.id, inputText, title, modelId);

        res.status(201).json({
            message: 'Mindmap created successfully',
            mindmap: { id, title: finalTitle, markdown },
        });
    } catch (error) {
        next(error);
    }
};

export const directUpdateMarkdownController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { markdownText } = req.body;
        const user = req.user as User;

        if (!user?.id) throw ApiError(401, 'Unauthorized');
        if (!id || !markdownText) throw ApiError(400, 'Mindmap ID and markdown text are required');

        const updatedMarkdown = await directUpdateMarkdown(parseInt(id), user.id, markdownText);

        res.status(200).json({
            message: 'Mindmap updated successfully',
            markdown: updatedMarkdown,
        });
    } catch (error) {
        next(error);
    }
};

export const generateAISuggestionController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { userPrompt, modelId } = req.body;
        const user = req.user as User;

        if (!user?.id) throw ApiError(401, 'Unauthorized');
        if (!id || !userPrompt) throw ApiError(400, 'Mindmap ID and user prompt are required');

        const { originalMarkdown, suggestedMarkdown } = await generateAISuggestion(
            parseInt(id),
            user.id,
            userPrompt,
            modelId
        );

        res.status(200).json({
            message: 'AI suggestion generated successfully',
            originalMarkdown,
            suggestedMarkdown,
        });
    } catch (error) {
        next(error);
    }
};

export const acceptAISuggestionController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { suggestedMarkdown } = req.body;
        const user = req.user as User;

        if (!user?.id) throw ApiError(401, 'Unauthorized');
        if (!id || !suggestedMarkdown) throw ApiError(400, 'Mindmap ID and suggested markdown are required');

        const updatedMarkdown = await acceptAISuggestion(parseInt(id), user.id, suggestedMarkdown);

        res.status(200).json({
            message: 'AI suggestion accepted and saved successfully',
            markdown: updatedMarkdown,
        });
    } catch (error) {
        next(error);
    }
};

export const getMindmapController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const user = req.user as User;

        if (!user?.id) throw ApiError(401, 'Unauthorized');
        if (!id) throw ApiError(400, 'Mindmap ID is required');

        const mindmap = await getMindmap(parseInt(id), user.id);

        res.status(200).json({
            message: 'Mindmap fetched successfully',
            mindmap,
        });
    } catch (error) {
        next(error);
    }
};

export const listMindmapsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as User;

        if (!user?.id) throw ApiError(401, 'Unauthorized');

        const mindmaps = await listMindmaps(user.id);

        res.status(200).json({
            message: 'Mindmaps fetched successfully',
            mindmaps,
        });
    } catch (error) {
        next(error);
    }
};



export const saveAIChatMessageController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { role, content } = req.body;
        const user = req.user as User;

        if (!user?.id) throw ApiError(401, 'Unauthorized');
        if (!id || !role || !content) throw ApiError(400, 'Mindmap ID, role, and content are required');

        await saveAIChatMessage(parseInt(id), user.id, role, content);

        res.status(200).json({
            message: 'Chat message saved successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const getAIChatMessagesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const user = req.user as User;

        if (!user?.id) throw ApiError(401, 'Unauthorized');
        if (!id) throw ApiError(400, 'Mindmap ID is required');

        const messages = await getAIChatMessages(parseInt(id), user.id);

        res.status(200).json({
            message: 'Chat messages fetched successfully',
            messages,
        });
    } catch (error) {
        next(error);
    }
};