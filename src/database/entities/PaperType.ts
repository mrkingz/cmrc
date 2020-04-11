import { Entity, Column, ManyToOne } from 'typeorm';
import { MinLength, MaxLength, IsDefined } from 'class-validator';

import ResearchCategory from './ResearchCategory';
import AbstractEntity from './AbsrtactEntity';

@Entity('paperTypes')
export default class PaperType extends AbstractEntity {
  @MinLength(5, PaperType.getMessage('minLength'))
  @MaxLength(50, PaperType.getMessage('maxLength'))
  @IsDefined(PaperType.getMessage('required'))
  @Column({ type: 'varchar', unique: true, length: 50 })
  paperType?: string;

  @Column({ type: 'uuid' })
  researchCategoryId!: string;

  @ManyToOne(() => ResearchCategory, researchCategory => researchCategory.paperTypes)
  researchCategory!: ResearchCategory;
}
