import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { protect, admin } from './middleware/authMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Admin Verification Route (Testing RBAC)
app.get('/api/admin/verify', protect, admin, (req, res) => {
  res.json({ message: 'Admin access confirmed', user: req.user });
});

export default app;