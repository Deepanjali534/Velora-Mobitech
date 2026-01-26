// server/app.js
import express, { json } from 'express';
import cors from 'cors';

// CRITICAL FIX 1: Add '.js' extension because you are using "type": "module"
// CRITICAL FIX 2: Use 'optimise.js' (with an 's') because that is the file you uploaded
import optimizeRoutes from './routes/optimise.js'; 

const app = express();

// CRITICAL FIX 3: Allow your specific Frontend port (Vite uses 5173)
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));

app.use(json());

// Routes
app.use('/api', optimizeRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});