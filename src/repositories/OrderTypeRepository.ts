import AbstractRepository from "./AbstractRepository";
import { IOrderType } from "../types/OrderType";
import { Repository, getRepository } from "typeorm";

export default class OrderTypeRepository extends AbstractRepository<IOrderType> {

  /**
   * @description  Array of fillables fields
   *
   * @protected
   * @type {Array<string>}
   * @memberof OrderTypeRepository
   */
  protected fillables: Array<string> = ['orderType'];

  /**
   * Creates an instance of OrderTypeRepository
   *
   * @returns OrderTypeRepository
   */
  public constructor() {
    super('OrderType');
  }

  /**
   * Gets the repository connector
   *
   * @returns {Repository<IOrderType>}
   * @memberof OrderTypeRepository
   */
  public getRepository(): Repository<IOrderType> {
    return getRepository(this.getEntityName());
  }
}