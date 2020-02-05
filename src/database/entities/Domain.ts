import {Column, Entity, ManyToOne} from 'typeorm';

import AbstractEntity from "./AbsrtactEntity";
import {IsDefined, MaxLength, MinLength} from "class-validator";
import ResearchCategory from "./ResearchCategory";

@Entity('domains')
export default class Domain extends AbstractEntity {

  @MinLength(3, { message: `$property must be at least $constraint1 characters` })
  @MaxLength(50, { message: `$property cannot be longer than $constraint1 characters` })
  @IsDefined({ message: '$property is required'})
  @Column({ type: 'varchar', unique: true, length: 50 })
  domain!: string;


  @Column({ type: 'uuid'})
  researchCategoryId!: string;

  @ManyToOne(() => ResearchCategory, researchCategory => researchCategory.domains)
  researchCategory!: ResearchCategory;
}
