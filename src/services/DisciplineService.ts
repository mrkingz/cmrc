import { Not } from 'typeorm';

import AbstractService from './AbstractService';
import { IDiscipline } from '../types/Discipline';
import AbstractRepository from '../repositories/AbstractRepository';
import DisciplineRepository from '../repositories/DisciplineRepository';

export default class DisciplineService extends AbstractService<IDiscipline> {
  public constructor() {
    super();
  }

  /**
   * Create a new instance of Discipline
   *
   * @param {IDiscipline} fields the fields from request body
   * @returns {Promise<IDiscipline>} a promise that resolves with the created instance
   * @memberof DisciplineService
   */
  public create(fields: IDiscipline): Promise<IDiscipline> {
    return super.create(fields, () =>
      this.checkDuplicate(
        { where: { discipline: fields.discipline } },
        this.getMessage(`error.duplicate`, fields.discipline),
      ),
    );
  }

  getRepository(): AbstractRepository<IDiscipline> {
    return new DisciplineRepository();
  }

  public async update(discipline: IDiscipline, fields: IDiscipline): Promise<IDiscipline> {
    const { discipline: update } = fields;

    return super.update(discipline, fields, async (data: IDiscipline) => {
      await this.checkDuplicate(
        { where: { discipline: update, id: Not(data.id) } },
        this.getMessage(`error.duplicate`, update),
      );
    });
  }
}
