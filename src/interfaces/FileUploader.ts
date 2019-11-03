import FileService from '../services/upload/FileService';
import { RequestHandler, ErrorRequestHandler } from 'express';

export default interface IFileUploader {

  /**
   * @description
   *
   * @returns {FileService}
   * @memberof IFileUploader
   */
  getFileUploader (fileType: string): FileService;

  /**
   * @description Uploads a file to storage
   * 
   * @param {string} fileType the file type to upload
   * @returns {RequestHandler} the express request handler
   * @memberof IFileUploader
   */
  uploadFileToStorage (fileType: string): RequestHandler;
}