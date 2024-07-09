import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import * as middlewares from './middlewares/middlewares';
import MessageResponse from './interfaces/MessageResponse';
import roadmaproute from './routes/roadmap.route';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });

  // res.json({
  //   message: 'Hello World!' + req.query.name,
  // });

});

app.use('/roadmap', roadmaproute);
// app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
