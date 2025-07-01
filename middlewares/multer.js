// src/middlewares/upload.js

const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');
const ImageKit = require('imagekit');

// ========== 1. IMAGEKIT SETUP ==========
const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
});

// ========== 2. MEMORY STORAGE + IMAGEKIT ==========
const memoryStorage = multer.memoryStorage();

const multerFilterImage = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, please upload only images.', 400), false);
  }
};

const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter: multerFilterImage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

// Single/multiple fields upload using memory
const uploadImages = (fields) => {
  return uploadMemory.fields(
    fields.map((field) => ({ name: field.name, maxCount: field.count }))
  );
};

const handleImages = (fieldname) => {
  return async (req, res, next) => {
    const files = req.files?.[fieldname];
    if (!files) return next();

    try {
      const uploaded = await Promise.all(
        files.map((file) =>
          imagekit.upload({
            file: file.buffer,
            fileName: `api-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpeg`,
            folder: '/uploads',
          })
        )
      );
      req.body[fieldname] = uploaded.map((file) => file.url);
      next();
    } catch (err) {
      console.error('🔥 ImageKit Upload Error:', err);
      return next(new AppError('Error uploading images to ImageKit', 500));
    }
  };
};

const handleMultipleImages = (fieldnames) => {
  return async (req, res, next) => {
    try {
      for (const fieldname of fieldnames) {
        const files = req.files?.[fieldname];
        if (!files) continue;

        const uploaded = await Promise.all(
          files.map((file) =>
            imagekit.upload({
              file: file.buffer,
              fileName: `${fieldname}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpeg`,
              folder: `/uploads/${fieldname}`,
            })
          )
        );

        req.body[fieldname] = (fieldname === 'image' || fieldname === 'coverImage')
          ? uploaded[0].url
          : uploaded.map((file) => file.url);
      }

      next();
    } catch (err) {
      console.error('🔥 ImageKit Upload Error:', err);
      return next(new AppError('Error uploading images to ImageKit', 500));
    }
  };
};

// ========== 3. DISK STORAGE ==========
const diskStorage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `import-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadDisk = multer({ storage: diskStorage });


// ========== 4. EXPORTS ==========
module.exports = {
  // Memory + ImageKit
  uploadImages,
  handleImages,
  handleMultipleImages,

  // Local disk
  uploadDisk,
};
