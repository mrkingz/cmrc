import AbstractRepository from "../repositories/AbstractRepository";
import {IOrderType} from "../types/OrderType";
import AbstractService from "./AbstractService";
import OrderTypeRepository from "../repositories/OrderTypeRepository";

export default class OrderTypeService extends AbstractService<IOrderType> {

  public constructor() {
    super();
  }

  /**
   * Creates a new instance of OrderType in database
   *
   * @param {OrderTypeService} fields
   * @returns Promise<OrderTypeService>
   * @memberOf OrderTypeService
   */
  public async create(fields: IOrderType): Promise<IOrderType> {
    return super.create(fields,() => this.checkForDuplicate(fields.orderType as string));
  }

  /**
   * A convenient method to check for duplicate service name
   *
   * @param {string} orderType the service name
   * @param {OrderTypeService} data the existing to compare
   * @memberOf OrderTypeService
   */
  private async checkForDuplicate(orderType: string, data?: IOrderType): Promise<void> {
    await super.checkDuplicate({ orderType }, `${orderType} already exist, duplicate not allowed!`,
       // this callback returns true if both ids match
       // Otherwise, duplicate error will be thrown
      (entity: IOrderType) => (data && entity.id === data.id)
    );
  }

  /**
   * Creates an return an AbstractRepository<OrderType> instance
   *
   * @returns {AbstractRepository<OrderTypeService>}
   * @memberOf OrderTypeService
   */
  public getRepository(): AbstractRepository<IOrderType> {
    return new OrderTypeRepository();
  }

  /**
   * Updates an instance of OrderType in database
   *
   * @param {IOrderType} condition the condition that will be used to identify the service to update
   * @param {IOrderType} fields the updated fields
   * @returns {Promise<IOrderType>} a promise that resolves with the updated services
   * @memberOf OrderTypeService
   */
  public async update(orderType: IOrderType, fields: IOrderType): Promise<IOrderType> {
   // const foundOrderType = await this.findOneOrFail(condition as FindOneOptions<IUser>);

    return super.update(
       orderType, fields,
      async (entity: OrderTypeService) => {
         const { orderType } = fields;
         await this.checkForDuplicate(orderType as string, orderType as IOrderType)
    });
  }
}