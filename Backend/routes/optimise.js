import { Router } from 'express';
import multer, { memoryStorage } from 'multer';
import { runOptimization } from '../controllers/optimise.controller';

const router = Router();
const upload = multer({ storage: memoryStorage() });

router.post('/optimize', upload.fields([
  { name: 'demandFile', maxCount: 1 },
  { name: 'supplyFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const result = await runOptimization(
      req.files.demandFile[0].buffer,
      req.files.supplyFile[0].buffer
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
