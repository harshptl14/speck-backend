// // middlewares/jwtAuthSocket.ts

// import { Socket } from 'socket.io';
// import jwt from 'jsonwebtoken';

// interface JwtPayload {
//     user: {
//         id: number;
//         // Add other user properties if necessary
//     };
// }

// export const jwtAuthMiddlewareSocket = (socket: Socket, next: (err?: any) => void) => {
//     // Tokens can be sent via auth payload or query params
//     const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
//     console.log(token)
//     if (!token) {
//         return next(new Error('Authorization token is missing'));
//     }

//     let jwtToken = token;
//     if (token.startsWith('Bearer ')) {
//         jwtToken = token.substring(7);
//     }

//     try {
//         const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET || '') as JwtPayload;
//         socket.data.userId = decoded.user.id;
//         console.log('Authenticated user ID:', socket.data.userId);
//         next();
//     } catch (err) {
//         console.error('JWT Authentication error:', err);
//         next(new Error('Authentication error'));
//     }
// };


import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const jwtAuthMiddlewareSocket = (socket: Socket, next: (err?: Error) => void) => {
    // const token = socket.handshake.auth?.token;
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
        console.error('Socket.IO auth error: No token provided');
        return next(new Error('Authentication error: No token provided'));
    }

    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        console.error('Socket.IO auth error: Invalid token format');
        return next(new Error('Authentication error: Invalid token format'));
    }

    const jwtToken = tokenParts[1];

    try {
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET || 'your-jwt-secret') as { user: { id: number } };
        socket.data.userId = decoded.user.id;
        console.log(`Socket.IO auth success: User ID ${decoded.user.id}`);
        next();
    } catch (error) {
        console.error('Socket.IO auth error:', error instanceof Error ? error.message : String(error));
        next(new Error('Authentication error: Invalid token'));
    }
};