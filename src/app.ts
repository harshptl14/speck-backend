// Library imports
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import http from 'http';
import { initSocket } from '../utils/socket';
require('dotenv').config();

// Local imports
import * as middlewares from './middlewares/middlewares';
import MessageResponse from './interfaces/MessageResponse';
import roadmapRoute from './routes/roadmap.route';
import { authRouter } from './routes/auth.route';
import { useGoogleStrategy } from './configs/auth.config';
import { jwtAuth } from './middlewares/auth.middlewares';
import userRouter from './routes/user.route';



const corsOptions = {
  origin: 'http://localhost:3000', // Make sure this matches your frontend URL exactly
  credentials: true, // This is crucial for allowing cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();

// Use middlewares
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true in production
      httpOnly: true,
      sameSite: 'lax', // or 'strict', depending on your needs
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/speck/v1/auth', authRouter);

app.get('/speck/v1/serverHealth', (req, res) => {
  res.status(200).send('Server is healthy');
});

useGoogleStrategy();

app.get<{}, MessageResponse>('/', jwtAuth, (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/speck/v1/roadmap', jwtAuth, roadmapRoute);
app.use('/speck/v1/user', jwtAuth, userRouter);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const server = http.createServer(app);
initSocket(server);

const SOCKET_PORT = process.env.SOCKET_PORT;
server.listen(SOCKET_PORT, () => {
  console.log(`Socket Server listening on port ${SOCKET_PORT}`);
});

export default app;