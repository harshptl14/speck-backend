// import { Server as HttpServer } from 'http';
// import { Server, Socket } from 'socket.io';
// import { createRoadmapHandler } from '../src/controllers/roadmap.controller';
// import { jwtAuthMiddlewareSocket } from '../src/middlewares/jwtAuthSocket';

// // Define `io` 
// let io: Server;

// export const initSocket = (server: HttpServer): void => {
//     io = new Server(server, {
//         cors: {
//             origin: [
//                 process.env.REDIRECT_URL_FRONTEND || '',
//                 process.env.URL_FRONTEND || ''
//             ].filter(url => url !== ''),
//             methods: ['GET', 'POST'],
//             allowedHeaders: ['Content-Type', 'Authorization'],
//             credentials: true,
//         },
//     });

//     // Middleware for authenticating WebSocket connections
//     io.use(jwtAuthMiddlewareSocket);

//     // Handle Socket.IO connections
//     io.on('connection', (socket: Socket) => {
//         const userId = socket.data.userId;
//         console.log(`User connected: ${socket.id}, User ID: ${userId}`);

//         // Event listener for 'createRoadmap'
//         socket.on('createRoadmap', async (data: { prompt: string }) => {
//             try {
//                 await createRoadmapHandler(data.prompt, socket);
//             } catch (error) {
//                 console.error('Error in createRoadmapHandler:', error);
//                 socket.emit('roadmapError', { message: 'Failed to create roadmap' });
//             }
//         });

//         // Listener for disconnection
//         socket.on('disconnect', () => {
//             console.log(`User disconnected: ${socket.id}`);
//         });
//     });
// };

// // Export `io` for access in other modules if necessary
// export { io };


import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createRoadmapHandler } from '../src/controllers/roadmap.controller';
import { jwtAuthMiddlewareSocket } from '../src/middlewares/jwtAuthSocket';

let io: Server | undefined;

export const initSocket = (server: HttpServer): void => {
    io = new Server(server, {
        path: '/socket',
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? [process.env.REDIRECT_URL_FRONTEND || '', process.env.URL_FRONTEND || ''].filter(url => url !== '')
                : 'http://localhost:3000',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    console.log('Socket.IO initialized with path /socket');

    io.use(jwtAuthMiddlewareSocket);

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId;
        console.log(`User connected: ${socket.id}, User ID: ${userId}`);

        socket.on('createRoadmap', async (data: { prompt: string }) => {
            console.log(`Received createRoadmap event from user ${userId}:`, data);
            try {
                await createRoadmapHandler(data.prompt, socket);
                console.log(`Roadmap created for user ${userId}`);
            } catch (error) {
                console.error('Error in createRoadmapHandler:', error);
                socket.emit('roadmapError', {
                    message: 'Failed to create roadmap',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });

        socket.on('disconnect', (reason) => {
            console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
        });
    });
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initSocket first.');
    }
    return io;
};