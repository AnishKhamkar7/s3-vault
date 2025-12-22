import multer from 'multer';
import { env } from '../../utils/env';

const storage = multer.memoryStorage();

const MAX_FILE_SIZE = env.MAX_FILE_SIZE ?? 5 * 1024 * 1024; // default 5MB

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export const single = (fieldName = 'file') => upload.single(fieldName);
