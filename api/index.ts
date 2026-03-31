import express from 'express';
import app from '../backend/src/app';

const server = express();

// Vercel routes requests as /api/*, so mount the app under that prefix.
server.use('/api', app);

export const config = {
  api: {
    bodyParser: false
  }
};

export default server;
