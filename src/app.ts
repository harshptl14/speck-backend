import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import http from 'http';
import morgan from 'morgan';
import helmet from 'helmet';
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
import { requireHTTPS } from './middlewares/middlewares';

const isProduction = process.env.NODE_ENV === 'production';

// Configure CORS options based on environment
const corsOptions: cors.CorsOptions = {
  origin: isProduction
    ? [
      process.env.REDIRECT_URL_FRONTEND || '',
      process.env.URL_FRONTEND || ''
    ].filter(url => url !== '')
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

const app = express();

// Basic middleware setup
app.use(cors(corsOptions));
app.use(express.json());

// Environment-specific middleware
if (isProduction) {
  app.use(requireHTTPS);
  app.set('trust proxy', 1);
} else {
  app.use(morgan('dev'));
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
}

// Session configuration
const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // Only true in production
    httpOnly: true,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  },
  proxy: isProduction
};

app.use(session(sessionConfig));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes
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

// Error handling
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// Server setup
const server = http.createServer(app);
initSocket(server);

const SOCKET_PORT = process.env.SOCKET_PORT || 3001; // Fallback port for local development
server.listen(SOCKET_PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Socket Server listening on port ${SOCKET_PORT}`);
});

export default app;