// handlers/createRoadmapHandler.ts

import { Socket } from 'socket.io';
import { createRoadmapSchema } from '../models/roadmapSchemas';
import { createRoadmapWithStatusUpdates } from '../services/roadmap.service/roadmapLongchain.service';


export const createRoadmapHandler = async (prompt: string, socket: Socket) => {
    // Validate input
    const validationResult = createRoadmapSchema.safeParse({ prompt });
    if (!validationResult.success) {
        socket.emit('roadmapError', { errors: validationResult.error.errors });
        return;
    }

    try {
        const response = await createRoadmapWithStatusUpdates(prompt, socket.data.userId, socket);
        socket.emit('roadmapComplete', response);
        socket.disconnect(); // Disconnect after completion
    } catch (error) {
        console.error('Error creating roadmap:', error);
        socket.emit('roadmapError', { message: 'Failed to create roadmap' });
        socket.disconnect();
    }
};