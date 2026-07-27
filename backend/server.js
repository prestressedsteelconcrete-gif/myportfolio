import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './src/routes/auth.js';
import profileRoutes from './src/routes/profile.js';
import segmentsRoutes from './src/routes/segments.js';
import projectsRoutes from './src/routes/projects.js';
import driveRoutes from './src/routes/drive.js';
import githubRoutes from './src/routes/github.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/segments', segmentsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/github', githubRoutes);

app.get('/', (req, res) => res.send('Portfolio backend চলছে ✓'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
