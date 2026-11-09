import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import { uploadController } from '../controllers/upload.controller.js';

const router = Router();

router.post(
  '/',
  upload.single('image'),
  uploadController.uploadImage.bind(uploadController)
);

export default router;

