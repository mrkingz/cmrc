import { isEmpty, pick, isEqual } from "lodash";
import { RequestHandler, Request } from "express";

import { IOrderType } from "../types/OrderType";
import AbstractController from "./AbstractController";
import IResponseData from "src/types/ResponseData";
import { Pagination } from 'src/types/Pangination';
import AbstractService from "../services/AbstractService";
import OrderTypeService from "../services/OrderTypeService";
import ValidationController from "./ValidationController";
import { FindOneOptions } from "typeorm";

/**
 * Controller that handles all http request and response for vendors
 *
 * @class ServiceController
 * @extends {AbstractController<OrderTypeService>}
 */
class OrderTypeController extends ValidationController<IOrderType> {
   /**
    *Creates an instance of OrderTypeController.
    * @memberof OrderTypeController
    */
   constructor(service: AbstractService<IOrderType>) {
     super(service);
   }

  /**
   * Creates a new service
   *
   * @returns {RequestHandler}
   * @memberof OrderTypeController
   */
  public create(): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponseData<IOrderType>> => {
      const orderType: IOrderType = await this.getServiceInstance().create(req.body);

      return this.getResponseData(
        orderType, this.getMessage(`entity.created`, 'Order type'), this.httpStatus.CREATED
      );
    });
  }

  /**
   * Gets all vendors
   *
   * @returns {RequestHandler}
   * @memberof OrderTypeController
   */
  public getOrderTypes(): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponseData<IOrderType>> => {
      const { query: { page, limit, sort }} = req;
      const orderTypes: Pagination<IOrderType> = await this.getServiceInstance().find({
        page, limit, sort
      });

      return this.getResponseData(orderTypes,
        this.getMessage(isEmpty(orderTypes.data) ? `entity.emptyList` : `entity.retrieved`, `Order types`))
    });
  }

  /**
   * Gets a specific service
   *
   * @returns {RequestHandler}
   * @memberof OrderTypeController
   */
  public getOrderType(): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponseData<IOrderType>> => {
      const { params: { orderTypeId }} = req;

      const orderType: IOrderType = await this.getServiceInstance().findOneOrFail(
        { id: orderTypeId } as FindOneOptions<IOrderType>, this.getMessage(`error.notFound`,'Order type')
      );

      return this.getResponseData(orderType, this.getMessage('entity.retrieved', `Order type`));
    });
  }

  /**
   * Updates a specific service
   *
   * @returns {RequestHandler}
   * @memberof OrderTypeController
   */
  public updateOrderType(): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponseData<IOrderType>> => {
      const update = await this.getServiceInstance().update({
        id: req.params.orderTypeId }, { orderType: req.body.orderType });

      return this.getResponseData(update, this.getMessage(`entity.updated`, `Order type`));
    });
  }

  /**
   * Deletes an OrderType
   *
   * @returns {RequestHandler}
   * @memberOf OrderTypeController
   */
  public deleteOrderType (): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponseData<IOrderType>> => {
      await this.getServiceInstance().delete(req['orderType'].id)
      return this.getResponseData({}, this.getMessage(`entity.deleted`, 'Order type'), this.httpStatus.OKAY);
    })
  }
}

export default new OrderTypeController(new OrderTypeService());