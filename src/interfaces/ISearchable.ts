import SearchClient from '../vendors/search/SearchClient';

export default interface ISearchable<T> {
  /**
   * Creates an instance of SearchClient
   *
   * @returns {SearchClient<T>}
   * @memberof ISearch
   */
  getSearchClient (): SearchClient<T>;
}