import lang from '../langs';
import CustomError from './CustomError';
import isEmpty = require('lodash.isempty');
import { startCase, camelCase, upperFirst } from 'lodash';
export default class Utilities {
  protected lang: object = lang;

  /**
   * Capitalizes the first character of a string
   *
   * @protected
   * @param {string} text
   * @returns
   * @memberof Utilities
   */
  protected upperFirst(str: string): string {
    return upperFirst(str);
  }

  protected titleCase(str: string): string {
    return startCase(camelCase(str));
  }

  /**
   * Gets properties or nexted poperties of an object by key or nexted keys
   *
   * @protected
   * @param {string} key the key or nexted keys
   * @param {{ [key: string]: string }} object the object or parent object
   * @returns {(string | object)}
   * @memberof Utilities
   */
  protected deep(key: string, object: { [key: string]: string }): string | object {
    const keys: Array<string> = key.split('.');
    const objKey: string = keys[0]; // the first object key
    let value;

    /*
     * If the current value of objKey is an object,
     * shift the array of keys and call the function deep
     */
    if (keys.length > 1 && typeof object[objKey] === 'object') {
      keys.shift();
      value = this.deep(keys.join('.'), object[objKey] as {});
    } else if (keys.length === 1) {
      value = object[objKey];
    }

    if (value) return value;

    throw this.error(`${key} is not a valid key`);
  }

  /**
   * Gets a property's value from the language object
   *
   * @protected
   * @param {string} key the error key
   * @param {string} target the targetted language
   * @returns {string}
   * @memberof Utilities
   */
  protected getLang(key: string, alias: string = ''): string | object {
    const lang = this.deep(key, this.lang as {});
    if (!isEmpty(lang)) {
      return typeof lang === 'string' ? (lang as string).replace(':value', alias) : (lang as object);
    }

    throw this.error(`${key} is not a valid key`);
  }

  /**
   * Gets the corresponding message from langs object
   *
   * @protected
   * @param {string} key
   * @param {string} [alias]
   * @returns {string}
   * @memberof Utilities
   */
  protected getMessage(key: string, alias?: string): string {
    return this.getLang(key, alias) as string;
  }

  /**
   * Creates an instance of CustomError
   *
   * @protected
   * @param {(string | object)} message
   * @param {number} [status]
   * @returns
   * @memberof Utilities
   */
  protected error(message: string | object, status?: number): CustomError {
    return new CustomError(message, status);
  }
}
