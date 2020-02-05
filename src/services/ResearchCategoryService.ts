import { Not} from "typeorm";

import constants from "../constants";
import AbstractService from "./AbstractService";
import AbstractRepository from "../repositories/AbstractRepository";
import {IResearchCategory, ResearchType} from "../types/ResearchCategory";
import ResearchCategoryRepository from "../repositories/ResearchCategoryRepository";

const { httpStatus } = constants;

export default class ResearchCategoryService extends AbstractService<IResearchCategory> {

  public constructor() {
    super();
  }

  /**
   * Creates a new instance of ResearchCategoryRepository in database
   *
   * @param {IResearchCategory} fields
   * @returns Promise<IResearchCategory>
   * @memberOf ResearchCategoryService
   */
  public async create(fields: IResearchCategory): Promise<IResearchCategory> {
    return super.create(fields,
      () => this.checkDuplicate(
        { where: { categoryName: fields.categoryName }},
         this.getMessage(`error.duplicate`, fields.categoryName))
      );
  }

  /**
   * Creates an return an AbstractRepository<IResearch> instance
   *
   * @returns {AbstractRepository<IResearchCategory>}
   * @memberOf ResearchCategoryService
   */
  public getRepository(): AbstractRepository<IResearchCategory> {
    return new ResearchCategoryRepository();
  }

  /**
   * Finds a specific ResearchCategory with all its associated relations
   *
   * @param {string} researchCategoryId
   * @param {string} researchType
   * @returns {Promise<IResearchCategory>}
   * @memberof ResearchCategoryService
   */
  public async findOneWithRelations(researchCategoryId: string, researchType: string): Promise<IResearchCategory> {

    const relations = {
      [ResearchType.Education]: ['disciplines', 'paperTypes'],
      [ResearchType.Empirical]: ['mediaTrends', 'mediaTypes'],
      [ResearchType.Practical]: ['domains']
    }

    return this.findOneOrFail({
      where: { id: researchCategoryId },
      relations: relations[researchType]
    });
  }

  /**
   * Updates an instance of ResearchCategoryRepository in database
   *
   * @param {IResearchCategory} research the research to update
   * @param {IResearchCategory} fields the updated fields
   * @returns {Promise<IResearchCategory>} a promise that resolves with the updated services
   * @memberOf ResearchCategoryService
   */
  public async update(researchCategory: IResearchCategory, fields: IResearchCategory): Promise<IResearchCategory> {
    const { categoryName: update } = fields;

    return super.update(
      researchCategory, fields,
      async (data: IResearchCategory) => {
        await this.checkDuplicate({ where: { categoryName: update, id: Not(data.id) }},
            this.getMessage(`error.duplicate`, update))
       });
  }

  /**
   * Deletes a research
   *
   * @param {IResearchCategory} research the research to delete
   * @returns Promise<void>
   */
  public async delete (researchCategory: IResearchCategory): Promise<void> {

    const { id, categoryName } = researchCategory;
    const hasRelation: boolean = await this.hasRelations({ id },['disciplines', 'paperTypes']);

    if (hasRelation)
      throw this.error(this.getMessage('error.relation', categoryName), httpStatus.FORBIDDEN);

    await super.delete(researchCategory);
  }
}