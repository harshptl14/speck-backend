// import app from './app';

// const port = process.env.PORT || 3001;
// app.listen(port, () => {
//   /* eslint-disable no-console */
//   console.log(`Listening: http://localhost:${port}`);
//   /* eslint-enable no-console */
// });



import { server } from './app';

const PORT = process.env.PORT || 4000; // Azure should set process.env.PORT

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server listening on port ${PORT}`);
  if (process.env.PORT) {
    console.log(`Using Azure-provided port: ${process.env.PORT}`);
  } else {
    console.log('process.env.PORT not set, using fallback port 4000');
  }
});