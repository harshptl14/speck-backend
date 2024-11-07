import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createRoadmapHandler } from '../src/handlers/createRoadmapHandler';
import { jwtAuthMiddlewareSocket } from '../src/middlewares/jwtAuthSocket';

// Define `io` 
let io: Server;

export const initSocket = (server: HttpServer): void => {
    io = new Server(server, {
        cors: {
            origin: `http://localhost:${process.env.FRONTEND_PORT}`,
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        },
    });

    // Middleware for authenticating WebSocket connections
    io.use(jwtAuthMiddlewareSocket);

    // Handle Socket.IO connections
    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId;
        console.log(`User connected: ${socket.id}, User ID: ${userId}`);

        // Event listener for 'createRoadmap'
        socket.on('createRoadmap', async (data: { prompt: string }) => {
            try {
                await createRoadmapHandler(data.prompt, socket);
            } catch (error) {
                console.error('Error in createRoadmapHandler:', error);
                socket.emit('roadmapError', { message: 'Failed to create roadmap' });
            }
        });

        // Listener for disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

// Export `io` for access in other modules if necessary
export { io };
