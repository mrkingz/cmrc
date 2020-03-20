import AbstractRepository from './AbstractRepository';
import { Repository, getRepository } from 'typeorm';
import { IMediaTrend } from '../types/MediaTrend';

export default class MediaTrend extends AbstractRepository<IMediaTrend> {
  protected fillables: Array<string> = ['mediaTrend', 'researchCategoryId'];

  constructor() {
    super('MediaTrend');
  }

  getRepository(): Repository<IMediaTrend> {
    return getRepository(this.getEntityName());
  }
}
