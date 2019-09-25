import lang from '../../lang';
import UtilityService from './UtitlityService';

export default abstract class LangService extends UtilityService {
  /**
   * @description The application's language object
   *
   * @protected
   * @type {object}
   * @memberof LangService
   */
  protected lang: object = lang;

  constructor () {
    super();
  }

  /**
   * @description Gets a property's value from the language object
   *
   * @protected
   * @param {string} key the error key
   * @param {string} target the error target
   * @returns {string}
   * @memberof UtilityService
   */
  protected getLang (key: string, target: string = ''): string | object {
    const lang = this.deep(key, this.lang as {});
    
    return lang.constructor === String
      ? (lang as string).replace(':value', target)
      : lang as object;
  }
}