import FileUploader from '../vendors/upload/FileUploader';
import FileStorage from '../vendors/upload/FileStorage';

export default interface IFileUploadable {
  /**
   * Gets an instance of FileUploader
   *
   * @returns {FileUploader}
   * @memberof FileUpload
   */
  getFileUploaderInstance(): FileUploader;

  /**
   * Gets an instance of Filestorage
   *
   * @returns {FileStorage} an instance of FileStorage
   * @memberof FileUpload
   */
  getFileStorageInstance(): FileStorage;
}
