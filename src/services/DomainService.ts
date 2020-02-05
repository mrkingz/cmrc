import {Not} from "typeorm";

import {IDomain} from "../types/Domain";
import AbstractService from "./AbstractService";
import DomainRepository from "../repositories/DomainRepository";
import AbstractRepository from "../repositories/AbstractRepository";

export default class DomainService extends AbstractService<IDomain> {
  public constructor() {
    super();
  }

  /**
   * Create a new instance of Domain
   * 
   * @param {IDomain} fields the fields from request body
   * @returns {Promise<IDomain>} a promise that resolves with the created instance
   * @memberof DomainService
   */
  public create(fields: IDomain): Promise<IDomain> {
    return super.create(fields, () => this.checkDuplicate(
      { where: { domain: fields.domain }},
      this.getMessage(`error.duplicate`, fields.domain)
    ));
  }

  getRepository(): AbstractRepository<IDomain> {
    return new DomainRepository();
  }

  public async update(domain: IDomain, fields: IDomain): Promise<IDomain> {
    const { domain: update } = fields;

    return super.update(
      domain, fields,
      async (data: IDomain) => {
        await this.checkDuplicate({ where: { domain: update, id: Not(data.id) }},
          this.getMessage(`error.duplicate`, update))
      });
  }
}