import express, { json } from 'express';
import cors from 'cors';
import optimizeRoutes from './routes/optimize';

const app = express();

app.use(cors());
app.use(json());

// Routes
app.use('/api', optimizeRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
