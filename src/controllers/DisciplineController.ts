import {RequestHandler, Request} from "express";

import CRUDController from "./CRUDController";
import {IDiscipline} from "../types/Discipline";
import IResponseData from "../types/ResponseData";
import AbstractService from "../services/AbstractService";
import DisciplineService from "../services/DisciplineService";

class DisciplineController extends CRUDController<IDiscipline> {

  /**
   *Creates an instance of ResearchController.
   * @memberof DisciplineController
   */
  public constructor(service: AbstractService<IDiscipline>) {
    super(service);
  }

  /**
   * Create a new Discipline
   *
   * @returns {RequestHandler}
   * @memberOf DisciplineController
   */
  public create (): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponseData<IDiscipline>> => {
      const {
        params: { researchCategoryId },
        body: { discipline }
      } = req;

      const newDiscipline: IDiscipline= await this.getServiceInstance().create({ discipline, researchCategoryId });

      return this.getResponseData(
        newDiscipline,
        this.getMessage(`entity.created`, this.getServiceInstance().getRepository().getEntityName()),
        this.httpStatus.CREATED
      );
    })
  }
}

export default new DisciplineController(new DisciplineService());