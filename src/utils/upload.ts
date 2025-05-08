// utils/upload.ts (or middlewares/upload.ts)
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the folder to store uploads
const uploadFolder = path.join(__dirname, "..", "uploads");

// Create the folder if it doesn't exist
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder); // Specify upload folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext); // File naming convention
  },
});

// Create Multer instance
const upload = multer({ storage });

export default upload;
