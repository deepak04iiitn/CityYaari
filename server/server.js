import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import http from 'http';
import { initSocketServer } from './src/socket/socketServer.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Bandhuu server running on port ${PORT}`);
});