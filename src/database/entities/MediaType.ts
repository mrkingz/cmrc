import { Column, Entity, ManyToOne } from 'typeorm';
import { IsDefined, MaxLength, MinLength } from 'class-validator';

import ResearchCategory from './ResearchCategory';
import AbstractEntity from './AbsrtactEntity';

@Entity('mediaTypes')
export default class MediaType extends AbstractEntity {
  @MinLength(3, MediaType.getMessage('minLength'))
  @MaxLength(50, MediaType.getMessage('maxLength'))
  @IsDefined(MediaType.getMessage('required'))
  @Column({ type: 'varchar', unique: true, length: 50 })
  mediaType!: string;

  @Column({ type: 'uuid' })
  researchCategoryId!: string;

  @ManyToOne(() => ResearchCategory, researchCategory => researchCategory.mediaTypes)
  researchCategory!: ResearchCategory;
}
