import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createRoadmapHandler } from '../src/controllers/roadmap.controller';
import { jwtAuthMiddlewareSocket } from '../src/middlewares/jwtAuthSocket';

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? [
                    process.env.REDIRECT_URL_FRONTEND || '',
                    process.env.URL_FRONTEND || ''
                ].filter(url => url !== '')
                : 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Middleware for authenticating WebSocket connections
    io.use(jwtAuthMiddlewareSocket);

    // Handle Socket.IO connections
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        // Event listener for 'createRoadmap'
        socket.on('createRoadmap', async (data: { prompt: string }) => {
            try {
                await createRoadmapHandler(data.prompt, socket);
            } catch (error) {
                console.error('Error in createRoadmapHandler:', error);
                socket.emit('roadmapError', { message: 'Failed to create roadmap' });
            }
        });
    });

    return io;
};
