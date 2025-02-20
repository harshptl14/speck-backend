import { app, server } from './app';

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Listening: http://localhost:${PORT}`);
  /* eslint-enable no-console */
});

