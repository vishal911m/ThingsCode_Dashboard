import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/connect.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler, notFound } from './helpers/errorhandler.js';
import http from 'http';
import { WebSocketServer } from 'ws';

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000', // frontend origin
    credentials: true,              // allow cookies to be sent
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', userRoutes);
app.use('/api/v1', taskRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);

  ws.on('close', () => {
    clients = clients.filter((client) => client !== ws);
  });
});

export const broadcastNewJob = (job) => {
  const payload = JSON.stringify({ type: 'NEW_JOB', data: job });
  clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
};

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
