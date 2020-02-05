import { Entity, Column, ManyToOne } from 'typeorm';
import { MinLength, MaxLength, IsDefined } from 'class-validator';

import ResearchCategory from "./ResearchCategory";
import AbstractEntity from './AbsrtactEntity';

@Entity('paperTypes')
export default class PaperType extends AbstractEntity {

  @MinLength(5, { message: `$property must be at least $constraint1 characters` })
  @MaxLength(50, { message: `$property cannot be longer than $constraint1 characters` })
  @IsDefined({ message: '$property is required'})
  @Column({ type: 'varchar', unique: true, length: 50 })
  paperType?: string;

  @Column({ type: 'uuid'})
  researchCategoryId!: string;

  @ManyToOne(type => ResearchCategory, researchCategory => researchCategory.paperTypes)
  researchCategory!: ResearchCategory;

}