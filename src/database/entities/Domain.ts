import { Column, Entity, ManyToOne } from 'typeorm';

import AbstractEntity from './AbsrtactEntity';
import { IsDefined, MaxLength, MinLength } from 'class-validator';
import ResearchCategory from './ResearchCategory';

@Entity('domains')
export default class Domain extends AbstractEntity {
  @MinLength(3, Domain.getMessage('minLength'))
  @MaxLength(50, Domain.getMessage('maxLength'))
  @IsDefined(Domain.getMessage('required'))
  @Column({ type: 'varchar', unique: true, length: 50 })
  domain!: string;

  @Column({ type: 'uuid' })
  researchCategoryId!: string;

  @ManyToOne(() => ResearchCategory, researchCategory => researchCategory.domains)
  researchCategory!: ResearchCategory;
}
