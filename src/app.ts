// Library imports
// import morgan from 'morgan';
// import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
require('dotenv').config();

// Local imports
import * as middlewares from './middlewares/middlewares';
import MessageResponse from './interfaces/MessageResponse';
import roadmaproute from './routes/roadmap.route';
import { authRouter } from './routes/auth.route'
import { useGoogleStrategy } from './configs/auth.config';
import { jwtAuth } from './middlewares/auth.middlewares';
import userRouter from './routes/user.route';
import { requireHTTPS } from './middlewares/middlewares';


const corsOptions: cors.CorsOptions = {
  origin: [
    process.env.REDIRECT_URL_FRONTEND || '',
    process.env.URL_FRONTEND || ''
  ].filter(url => url !== ''),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};


const app = express();
app.use(cors(corsOptions));
app.use(requireHTTPS);
// app.use(morgan('dev'));
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(express.json());
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Railway uses HTTPS
    httpOnly: true,
    sameSite: 'none', // Important for cross-origin requests
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    // Don't set domain explicitly when using Railway
    // domain: undefined // Let the browser handle the domain
  },
  proxy: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/speck/v1/auth', authRouter)
app.get('/speck/v1/serverHealth', (req, res) => {
  res.status(200).send('Server is healthy');
});

useGoogleStrategy();

app.get<{}, MessageResponse>('/', jwtAuth, (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/speck/v1/roadmap', jwtAuth, roadmaproute);
app.use('/speck/v1/user', jwtAuth, userRouter);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
