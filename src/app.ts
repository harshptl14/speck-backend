// import express from 'express';
// import cors from 'cors';
// import passport from 'passport';
// import session from 'express-session';
// import http from 'http';
// import morgan from 'morgan';
// import helmet from 'helmet';
// import { initSocket } from '../utils/socket';
// require('dotenv').config();

// // Local imports
// import * as middlewares from './middlewares/middlewares';
// import MessageResponse from './interfaces/MessageResponse';
// import roadmapRoute from './routes/roadmap.route';
// import { authRouter } from './routes/auth.route';
// import { useGoogleStrategy } from './configs/auth.config';
// import { jwtAuth } from './middlewares/auth.middlewares';
// import userRouter from './routes/user.route';
// import { requireHTTPS } from './middlewares/middlewares';

// const isProduction = process.env.NODE_ENV === 'production';

// // Configure CORS options based on environment
// const corsOptions: cors.CorsOptions = {
//   origin: isProduction
//     ? [
//       process.env.REDIRECT_URL_FRONTEND || '',
//       process.env.URL_FRONTEND || ''
//     ].filter(url => url !== '')
//     : 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
//   exposedHeaders: ['Set-Cookie'],
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// };

// const app = express();

// // Basic middleware setup
// app.use(cors(corsOptions));
// app.use(express.json());

// // Environment-specific middleware
// if (isProduction) {
//   app.use(requireHTTPS);
//   app.set('trust proxy', 1);
// } else {
//   app.use(morgan('dev'));
//   app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// }

// // Session configuration
// const sessionConfig: session.SessionOptions = {
//   secret: process.env.SESSION_SECRET || "your-secret-key",
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: isProduction, // Only true in production
//     httpOnly: true,
//     sameSite: isProduction ? 'none' as const : 'lax' as const,
//     // maxAge: 24 * 60 * 60 * 1000, // 24 hours
//     path: '/',
//   },
//   proxy: isProduction
// };

// app.use(session(sessionConfig));

// // Passport setup
// app.use(passport.initialize());
// app.use(passport.session());

// // Routes
// app.use('/speck/v1/auth', authRouter);

// app.get('/speck/v1/serverHealth', (req, res) => {
//   res.status(200).send('Server is healthy');
// });

// useGoogleStrategy();

// app.get<{}, MessageResponse>('/', jwtAuth, (req, res) => {
//   res.json({
//     message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
//   });
// });

// app.use('/speck/v1/roadmap', jwtAuth, roadmapRoute);
// app.use('/speck/v1/user', jwtAuth, userRouter);

// // Error handling
// app.use(middlewares.notFound);
// app.use(middlewares.errorHandler);

// // Server setup
// const server = http.createServer(app);
// initSocket(server);

// const SOCKET_PORT = process.env.SOCKET_PORT || 3001; // Fallback port for local development
// server.listen(SOCKET_PORT, () => {
//   console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
//   console.log(`Socket Server listening on port ${SOCKET_PORT}`);
// });

// export default app;


import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import http from 'http';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initSocket } from '../utils/socket';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

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

// ✅ Debug Log: Check if the app is running in production or development
logger.info(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);

// ✅ Debug Log: Ensure required env variables are loaded
const requiredEnvVars = ['SESSION_SECRET', 'SOCKET_PORT', 'REDIRECT_URL_FRONTEND', 'URL_FRONTEND'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    logger.warn(`WARNING: Environment variable ${envVar} is missing!`);
  }
});

// ✅ Configure CORS options based on environment
const corsOptions: cors.CorsOptions = {
  origin: isProduction
    ? [
      process.env.REDIRECT_URL_FRONTEND || '',
      process.env.URL_FRONTEND || '',
    ].filter((url) => url !== '')
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const app = express();

// ✅ Debug Log: Ensure CORS is set correctly
logger.info(`CORS Configured for: ${JSON.stringify(corsOptions.origin)}`);

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Azure App Service uses a reverse proxy - ensure `trust proxy` is enabled
if (isProduction) {
  app.use(requireHTTPS);
  app.set('trust proxy', 1);
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
}

// ✅ Debug Log: Session Configuration
logger.info(`Session secure flag: ${isProduction}`);

const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // Required for HTTPS in production
    httpOnly: true,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    path: '/',
  },
  proxy: isProduction, // Required for Azure reverse proxy
};

app.use(session(sessionConfig));

// ✅ Debug Log: Session initialized
logger.info('Session middleware initialized');

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// ✅ Debug Log: Passport initialized
logger.info('Passport authentication initialized');

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

// ✅ Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error: ${err.message} | Stack: ${err.stack}`);
  console.error(err); // Ensure Azure logs this
  res.status(500).json({ message: 'Internal Server Error' });
});

// ✅ Server setup
const server = http.createServer(app);
initSocket(server);

const SOCKET_PORT = process.env.SOCKET_PORT || 3001; // Fallback port for local development
server.listen(SOCKET_PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`Socket Server listening on port ${SOCKET_PORT}`);
});

// ✅ Catch uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message} | Stack: ${err.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

export default app;
