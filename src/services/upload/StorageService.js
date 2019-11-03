/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import cloudinary from 'cloudinary';
import cloudinaryStorage from 'multer-storage-cloudinary';

import configs from '../../configs';

cloudinary.config(configs.app.cloudinaryConfig);

export default class StorageService {
    /**
     * @description A singleton of StorageService.
     *
     * @static
     * @memberof StorageService
     */
    static singleton;

    /**
     * @description Creates a singleton of StorageService.
     * @memberof StorageService
     */
    constructor () {
        return !!StorageService.singleton ? StorageService.singleton : this;
    }

    /**
     * @description Gets the name of the folder where file will be saved
     *
     * @returns {string} the folder name
     * @memberof UploadService
     */
    getBucketName () {
        return configs.app.name.toLowerCase();
    }

    /**
     * @description Gets the cloud storage for the file
     *
     * @param {string} [fileName] the new file name
     * @memberof StorageService
     */
    getCloudStorage (fileName) {
        return cloudinaryStorage({
            cloudinary,
            folder: this.getBucketName(),
            /**
             * Rename this file to avoid name conflict
             */
            filename: (req, file, callback) => {
                callback(req, `${fileName}`);
            },
        });
    }

    /**
     * @description The file public id
     *
     * @param {string} fileName
     * @returns {string} the public id
     * @memberof StorageService
     */
    getFilePublicId (fileName) {
        return `${this.getBucketName()}/${fileName}`;
    }

    /**
     * @description Deletes a file from cloud storage
     *
     * @param {string} fileName the name of the file to delete
     * @memberof StorageService
     */
    deleteFile (fileName) {
        cloudinary.uploader.destroy(this.getFilePublicId(fileName));
    }
}
