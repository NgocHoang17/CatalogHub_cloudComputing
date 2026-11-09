import multer from 'multer';
import { Request } from 'express';
import { AppError } from './error.middleware.js';

// Store files in memory buffer for streaming to Cloudinary
const storage = multer.memoryStorage();

// File filter: images only
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, WEBP, GIF) are allowed.', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

