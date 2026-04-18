const multer = require('multer');
const path = require('path');
const stream = require('stream');
const cloudinary = require('cloudinary').v2;

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Configure storage
const storage = hasCloudinaryConfig
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(
          null,
          `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
        );
      }
    });

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain' // .txt
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.mimetype === 'application/octet-stream') {
    // Fallback: Check extension if mime type is generic
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file extension for octet-stream: ${ext}`), false);
    }
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: Images, PDF, DOC, DOCX, TXT`), false);
  }
};

// Upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  },
  fileFilter: fileFilter
});

const resolveFolder = (file) => {
  if (file.fieldname === 'avatar') return 'printkart/avatars';
  if (file.fieldname === 'images') return 'printkart/products';
  if (file.fieldname === 'file') return 'printkart/customizations';
  return 'printkart/uploads';
};

const uploadFileToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const uploader = cloudinary.uploader.upload_stream(
      {
        folder: resolveFolder(file),
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.Readable.from(file.buffer).pipe(uploader);
  });

const cloudinaryPostProcessor = async (req, res, next) => {
  if (!hasCloudinaryConfig) return next();
  try {
    const files = [];
    if (req.file) files.push(req.file);
    if (Array.isArray(req.files)) files.push(...req.files);

    if (files.length === 0) return next();

    await Promise.all(
      files.map(async (file) => {
        const result = await uploadFileToCloudinary(file);
        // Keep compatibility with existing controllers that read file.filename/path.
        file.filename = result.secure_url;
        file.path = result.secure_url;
        file.cloudinary = {
          publicId: result.public_id,
          url: result.secure_url
        };
      })
    );

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  single: (field) => [upload.single(field), cloudinaryPostProcessor],
  array: (field, maxCount) => [upload.array(field, maxCount), cloudinaryPostProcessor],
  fields: (fields) => [upload.fields(fields), cloudinaryPostProcessor]
};

