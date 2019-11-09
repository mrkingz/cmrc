import { Client, ClientOptions, ApiResponse } from '@elastic/elasticsearch';

import configs from '../../configs/index';
import AbstractRepository from '../repositories/AbstractRepository';
import { PaginationParams } from '../../interfaces/Pangination';

export default class SearchClient<T> extends Client {
  /**
   * @description The name of the index
   *
   * @private
   * @type {string}
   * @memberof SearchClient
   */
  private readonly indexName: string;

  /**
   * @description A singleton of SearchClient
   *
   * @private
   * @static
   * @type {Client}
   * @memberof SearchClient
   */
  private static singleton: Client;

  private repository: AbstractRepository<T>;

  /**
   * @description Creates an singleton of SearchClient.
   * 
   * @param {ClientOptions} [clientOptions] client configuration options
   * @memberof ElasticSearch
   */
  public constructor (respository: AbstractRepository<T>) {
    super ({
      node: configs.database.elasticSearch.node,
      auth: {
        username: configs.database.elasticSearch.credentials.username,
        password: configs.database.elasticSearch.credentials.password
      }
    } as ClientOptions);

    this.repository = respository;
    this.indexName = `${configs.app.name.toLowerCase()}_${this.getRepository().getEntityName().toLowerCase()}`;

    return (!!SearchClient.singleton
      ? SearchClient.singleton
      : this) as SearchClient<T>;
  }

  /**
   * @description 
   *
   * @private
   * @returns {Client}
   * @memberof SearchClient
   */
  public async createIndex (payload: T): Promise<ApiResponse<any, any>> {
    const { id, ...body } = payload as any;

    return this.index({
      index: this.indexName, 
      refresh: 'true', 
      id, 
      body
    });
  }

  /**
   * @description Gets the repository instance
   *
   * @protected
   * @returns {AbstractRepository<T>}
   * @memberof SearchClient
   */
  protected getRepository(): AbstractRepository<T> {
    return this.repository;
  }

  /**
   * @description Searches an index
   *
   * @param {{[key: string]: any}} queryBody
   * @param {PaginationParams} paginationData
   * @returns {Promise<ApiResponse<any, any>>}
   * @memberof SearchClient
   */
  public async searchIndex (queryBody: {[key: string]: any}, paginationData: PaginationParams): Promise<ApiResponse<any, any>> {
    const { limit, page, sort } = paginationData;
    const {
      skip, 
      itemsPerPage, 
      currentPage 
    } = await this.getRepository().computePaginationData(Number(limit), Number(page));

    const { body } = await this.search({
      index: this.indexName,
      body: { query: queryBody, size: itemsPerPage, from: skip, sort }
    });

    return {
      data: body.hits.hits.map((source: { [key: string]: any }) => ({
        id: source._id,
        ...source._source,
      })),
      pagination: this.getRepository().getPaginationData(
        body.hits.total.value, itemsPerPage, currentPage
      )
    } as any;
  }
};
