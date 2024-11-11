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


const corsOptions = {
  origin: process.env.REDIRECT_URL_FRONTEND,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  secure: true, // Always true in production
  maxAge: 24 * 60 * 60, // Pre-flight request caching
  optionsSuccessStatus: 200
};


const app = express();
app.use(cors(corsOptions));
// app.use(morgan('dev'));
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Always use secure cookies in production
    httpOnly: true,
    sameSite: 'none', // Adjust based on your domain setup
    maxAge: 24 * 60 * 60 * 1000,
    domain: process.env.COOKIE_DOMAIN // Add your domain
  },
  name: 'sessionId', // Change default connect.sid name
  proxy: true // Trust the reverse proxy
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
