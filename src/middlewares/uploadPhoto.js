import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import createHttpError from 'http-errors';

// Налаштування Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Налаштування storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'contacts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 500, height: 500, crop: 'limit' },
      { quality: 'auto' },
    ],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(createHttpError(400, 'Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadPhoto = upload.single('photo');

const uploadPhotoMiddleware = (req, res, next) => {
  uploadPhoto(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          createHttpError(400, 'File too large. Maximum size is 5MB'),
        );
      }
      return next(createHttpError(400, err.message));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

export default uploadPhotoMiddleware;
