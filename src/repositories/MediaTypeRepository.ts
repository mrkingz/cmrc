import AbstractRepository from './AbstractRepository';
import {Repository, getRepository } from 'typeorm';
import {IMediaType} from '../types/MediaType';

export default class MediaType extends AbstractRepository<IMediaType> {

  protected fillables: Array<string> = ['mediaType', 'researchCategoryId'];


  constructor() {
    super('MediaType');
  }

  getRepository(): Repository<IMediaType> {
    return getRepository(this.getEntityName());
  }
}