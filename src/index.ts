// import app from './app';

// const port = process.env.PORT || 3001;
// app.listen(port, () => {
//   /* eslint-disable no-console */
//   console.log(`Listening: http://localhost:${port}`);
//   /* eslint-enable no-console */
// });



import { server } from './app';

const PORT = process.env.PORT || 4000; // Single port for both Express and Socket.IO

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server listening on port ${PORT}`);
});