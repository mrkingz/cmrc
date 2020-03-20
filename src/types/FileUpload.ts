import multer from 'multer';

export interface IFileUpload {
  StorageEngine: multer.StorageEngine;
  UploadHandler: multer.Instance;
}
