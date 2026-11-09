import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { AppError } from '../middlewares/error.middleware.js';

export class UploadController {
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No image file provided. Please attach a file under the "image" field.', 400);
      }

      const result = await uploadToCloudinary(req.file.buffer);

      res.status(201).json({
        success: true,
        message: 'Image uploaded to Cloudinary successfully',
        data: {
          url: result.url,
          public_id: result.public_id,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const uploadController = new UploadController();

