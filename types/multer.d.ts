// types/multer.d.ts
import * as express from 'express';
import { Multer } from 'multer'; // Import Multer's type

declare global {
  namespace Express {
    interface Request {
      files: {
        [fieldname: string]: Multer.File[]; // Define an array of files for each field
      };
    }
  }
}
