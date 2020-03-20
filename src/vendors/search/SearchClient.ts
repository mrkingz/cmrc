import { Client, ClientOptions, ApiResponse } from '@elastic/elasticsearch';

import configs from '../../configs/index';
import AbstractRepository from '../../repositories/AbstractRepository';
import { Pagination, PaginationParams } from '../../types/Pangination';
import { ISearchPayload, SearchHit } from '../../types/SearchOptions';
import { isEmpty } from 'lodash';

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

  private readonly repository: AbstractRepository<T>;

  /**
   * @description Creates an singleton of SearchClient.
   *
   * @param {AbstractRepository<T>} repository the repository to search
   * @memberof ElasticSearch
   */
  public constructor(repository: AbstractRepository<T>) {
    super({
      node: configs.database.elasticSearch.node,
      auth: {
        username: configs.database.elasticSearch.credentials.username,
        password: configs.database.elasticSearch.credentials.password,
      },
    } as ClientOptions);

    this.repository = repository;
    this.indexName = `${configs.app.name.toLowerCase()}_${this.getRepository()
      .getEntityName()
      .toLowerCase()}`;

    return (!!SearchClient.singleton ? SearchClient.singleton : this) as SearchClient<T>;
  }

  /**
   * Creates an index to search
   *
   * @param {string} id
   * @param {T} payload
   * @returns {Promise<ApiResponse<string, object>>}
   * @memberof SearchClient
   */
  public async createIndex(id: string, payload: T): Promise<ApiResponse<string, object>> {
    return this.index({
      index: this.indexName,
      refresh: 'true',
      id,
      body: payload,
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
   * @param {object} queryBody
   * @param {PaginationParams} paginationData
   * @returns {Promise<ApiResponse<any, any>>}
   * @memberof SearchClient
   */
  public async searchIndex(searchPayload: ISearchPayload, paginationParams: PaginationParams): Promise<Pagination<T>> {
    const { limit, page, sort } = paginationParams;
    const sortArray = sort ? sort.split(':') : [];

    const { skip, itemsPerPage, currentPage } = await this.getRepository().computePagination(
      Number(limit),
      Number(page),
    );

    const { body } = await this.search({
      index: this.indexName,
      body: {
        query: {
          multi_match: {
            type: 'phrase_prefix',
            ...searchPayload,
          },
        },
        size: itemsPerPage,
        from: skip,
        sort: isEmpty(sortArray) ? sortArray : [{ [`${sortArray[0]}.keyword`]: { order: `${sortArray[1]}` } }],
      },
    });

    return {
      data: body.hits.hits.map((source: SearchHit) => ({
        id: source._id,
        ...source._source,
      })),
      pagination: this.getRepository().getPaginationMeta(body.hits.total.value, itemsPerPage, currentPage),
    } as Pagination<T>;
  }
}
