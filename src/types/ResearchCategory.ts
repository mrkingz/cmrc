import Discipline from '../database/entities/Discipline';
import PaperType from '../database/entities/PaperType';

export interface IResearchCategory {
  id?: string;
  categoryName?: string;
  disciplines?: Array<Discipline>;
  paperType?: Array<PaperType>;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ResearchType {
  Empirical = 'empirical',
  Practical = 'practical',
  Education = 'education',
}
