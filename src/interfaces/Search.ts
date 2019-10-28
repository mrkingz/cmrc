import SearchClient from '../services/search/SearchClient';

export default interface ISearch<T> {
  /**
   * @description Creates an instance of SearchClient
   *
   * @returns {SearchClient<T>}
   * @memberof ISearch
   */
  getSearchClient (): SearchClient<T>;
}