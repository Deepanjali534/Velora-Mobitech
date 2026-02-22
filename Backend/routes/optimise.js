// routes/optimise.js

import { Router } from "express";
import multer from "multer";

import sendToPython from "../utils/sendToPython.js";

const router = Router();

const upload = multer({ dest: "uploads/" });

const uploadFields = upload.fields([
  { name: "demandFile", maxCount: 1 },
  { name: "supplyFile", maxCount: 1 },
]);

router.post(
  "/optimise",
  uploadFields,

  async (req, res) => {
    try {
      const result = await sendToPython(req.file.path);

      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  },
);

export default router;
