import lang from '../../lang';
import CustomError from '../../validations/CustomError';
export default class UtilityService {

  /**
   * @description The application's language object
   *
   * @protected
   * @type {object}
   * @memberof LangService
   */
  protected lang: object = lang;

  /**
   * @description Capitalizes the first character of a string
   *
   * @protected
   * @param {string} text
   * @returns
   * @memberof UtilityService
   */
  protected capitalizeFirst (text: string): string {
    return `${text.charAt(0).toUpperCase()}${text.substr(1)}`;
  }

  /**
   * @description Gets properties or nexted poperties of an object by key or nexted keys
   *
   * @protected
   * @param {string} key the key or nexted keys
   * @param {{ [key: string]: string }} object the object or parent object
   * @returns {(string | object)}
   * @memberof UtilityService
   */
  protected deep (key: string, object: { [key: string]: string }): string | object {

    const keys: Array<string> = key.split('.');
    const objKey: string = keys[0]; // the first object key
    let value;

    /**
     * If the current value of the objKey is an object,
     * remove thecall the function
     */
    if (keys.length > 1 && object[objKey].constructor === Object) {
      keys.shift()
      value = this.deep(keys.join('.'), object[objKey] as {});
    } else if (keys.length === 1) {
      value = object[objKey]
    }
    
    if (value) {
      return value;
    }
    throw this.rejectionError(`${key} is not a valid key`);
  }

  /**
   * @description Gets a property's value from the language object
   *
   * @protected
   * @param {string} key the error key
   * @param {string} target the targetted language
   * @returns {string}
   * @memberof UtilityService
   */
  protected getLang (key: string, target: string = ''): string | object {
    const lang = this.deep(key, this.lang as {});
    
    return lang.constructor === String
      ? (lang as string).replace(':value', target)
      : lang as object;
  }

  /**
   * @description Creates an instance of CustomError
   *
   * @protected
   * @param {(string | object)} message
   * @param {number} [status]
   * @returns
   * @memberof UtilityService
   */
  protected rejectionError(message: string | object, status?: number): CustomError {
    return new CustomError(message, status);
  }
};