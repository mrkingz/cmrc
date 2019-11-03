import path from 'path';
import multer from 'multer';

import UtilityService from '../utilities/UtilityService';
import StorageService from './StorageService';

/**
 *
 *
 * @class Fileservice
 */
export default class FileService extends UtilityService {

  /**
   * @description Creates an instance of Fileservice
   * 
   * @param {StorageService} storageInstance
   * @memberof Fileservice
   */
  public constructor () {
    super();
  }

  /**
   * @description Gets file format
   *
   * @protected
   * @param {string} fileType the type of file
   * @returns {array} array of image format
   * @method getFileFormat
   * @memberof Fileservice
   */
  protected getFileFormats (fileType: string): Array<string> {
    const fileFormats: {[key: string]: Array<string>} = {
      image: ["jpeg", "jpg", "png", "gif"]
    }

    return fileFormats[fileType]
  }

  /**
   * @description Upload profile photo
   *
   * @param {string} fileName the file name
   * @returns {Promie} A promise
   * @method uploadPhoto
   * @memberof Fileservice
   */
  public uploadFile (fileName: string, fileType: string): multer.Instance {
    return multer({
      storage: this.getStorageInstance().getCloudStorage(fileName) as any,

      limits: { fileSize: 1000000 },
      /**
       * Validates the uploaded file
       */
      fileFilter: (req:  Express.Request, file: Express.Multer.File, callback: Function): void => {
        this.validateFile(file, fileType, callback);
      }
    });
  }

  /**
   * @description Deletes a file
   *
   * @param {string} fileName the name of the file to delete
   * @memberof Fileservice
   */
  public deleteFile (fileName: string): void {
    this.getStorageInstance().deleteFile(fileName);
  }

  /**
   * @description Gets the regular expression to validate a file extension
   *
   * @protected
   * @param {string} fileType
   * @returns {RegExp} a regex 
   * @memberof Fileservice
   */
  protected getFileExtRegExp (fileType: string): RegExp {
   const fileTypesRegEx: {[key: string]: RegExp} = {
      image: /jpeg|jpg|png|gif/
    }

    return fileTypesRegEx[fileType];
  }

  /**
   * @description Gets the regular expression to validate a file mimetype
   *
   * @protected
   * @param {string} fileType
   * @returns {RegExp} a regex 
   * @memberof Fileservice
   */
  protected getFileMimetypeRegExp (fileType: string): RegExp {
    const mimeTypesRegEx: {[key: string]: RegExp} = {
       image: /^(image)\/(jpeg|jpg|png|gif)$/
     }
 
     return mimeTypesRegEx[fileType];
   }

  /**
   * @description Validates file
   *
   * @protected
   * @param {object} file the file object
   * @param {string} fileType the type of file
   * @param {function} callback callback function
   * @returns {function} result of the callback
   * @method validatePhoto
   * @memberof Fileservice
   */
  protected validateFile (file: Express.Multer.File, fileType: string, callback: Function): void {
    // validate the file extension and mimetype
    const extName = this.getFileExtRegExp(fileType).test(path.extname(file.originalname).toLowerCase());
    const mimeType = this.getFileMimetypeRegExp(fileType).test(file.mimetype);

    return (extName && mimeType) 
      ? callback(null, true)
      : callback(this.rejectionError(
          this.getMessage('error.file.invalid', this.getFileFormats(fileType).join(", "))
        ));
  }

  /**
   * @description Gets the storage service instance
   *
   * @protected
   * @returns {StorageService} an instance of StorageService
   * @memberof Fileservice
   */
  protected getStorageInstance (): StorageService {
    return new StorageService();
  }
}