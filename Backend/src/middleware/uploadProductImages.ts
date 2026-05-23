import multer from "multer";
import { AppError } from "../errors/AppError.js";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (req, file, callback) => {
  if (!file.mimetype.startsWith("image/")) {
    callback(new AppError("Only image files are allowed", 400));
    return;
  }

  callback(null, true);
};

export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});
