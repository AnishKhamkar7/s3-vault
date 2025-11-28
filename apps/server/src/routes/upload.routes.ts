import express from "express";
import { single } from "../lib/multer";
import { uploadBufferToS3, deleteFromS3 } from "../utils/storage";

const router = express.Router();

router.post("/", single("file"), async (req, res, next) => {
  try {
    // multer places file on req.file when using single
    const file = req.file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const key = `${Date.now()}-${file.originalname}`;
    const url = await uploadBufferToS3(file.buffer, key, file.mimetype);

    res.status(201).json({ key, url });
  } catch (err) {
    next(err);
  }
});

router.delete("/:key", async (req, res, next) => {
  try {
    const { key } = req.params;
    await deleteFromS3(key);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
