// middlewares/jwtAuthSocket.ts

import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    user: {
        id: number;
        // Add other user properties if necessary
    };
}

export const jwtAuthMiddlewareSocket = (socket: Socket, next: (err?: any) => void) => {
    // Tokens can be sent via auth payload or query params
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    console.log(token)
    if (!token) {
        return next(new Error('Authorization token is missing'));
    }

    let jwtToken = token;
    if (token.startsWith('Bearer ')) {
        jwtToken = token.substring(7);
    }

    try {
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET || '') as JwtPayload;
        socket.data.userId = decoded.user.id;
        console.log('Authenticated user ID:', socket.data.userId);
        next();
    } catch (err) {
        console.error('JWT Authentication error:', err);
        next(new Error('Authentication error'));
    }
};