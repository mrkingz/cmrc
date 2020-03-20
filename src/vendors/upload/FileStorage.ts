import cloudinary from 'cloudinary';
import cloudinaryStorage from 'multer-storage-cloudinary';

import configs from '../../configs';
import { IFileUpload } from '../../types/FileUpload';

cloudinary.config(configs.app.cloudinaryConfig);

export default class FileStorage {
  private bucketName!: string;

  constructor(bucketName: string) {
    this.setBucketName(bucketName);
  }

  /**
   * Sets the name of the folder/bucket where file will be saved
   *
   * @param {string} bucketName the name of the folder/bucket
   * @memberof FileStorage
   */
  public setBucketName(bucketName: string): void {
    this.bucketName = bucketName;
  }

  /**
   * Gets the name of the folder/bucket where file will be saved
   *
   * @returns {string} the folder/bucket name
   * @memberof FileStorage
   */
  getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Gets the storage for the file
   *
   * @param {string} [fileName] the new file name
   * @memberof FileStorage
   */
  getStorage(fileName: string): IFileUpload['StorageEngine'] {
    return cloudinaryStorage({
      cloudinary,
      folder: this.getBucketName(),
      /**
       * Rename this file to avoid name conflict
       */
      filename: (req: Request, file: object, callback: Function) => callback(req, `${fileName}`),
    });
  }

  /**
   * Gets the public id of the file
   *
   * @param {string} fileName
   * @returns {string} the public id
   * @memberof FileStorage
   */
  getFilePublicId(fileName: string): string {
    return `${this.getBucketName()}/${fileName}`;
  }

  /**
   * Deletes a file from storage
   *
   * @param {string} fileName the name of the file to delete
   * @memberof FileStorage
   */
  deleteFile(fileName: string): void {
    cloudinary.uploader.destroy(this.getFilePublicId(fileName));
  }
}
