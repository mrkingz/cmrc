import {Column, Entity, ManyToOne} from 'typeorm';
import AbstractEntity from "./AbsrtactEntity";
import ResearchCategory from "./ResearchCategory";
import {IsDefined, MaxLength, MinLength} from "class-validator";

@Entity('mediaTrends')
export default class MediaTrend extends AbstractEntity {

  @MinLength(3, { message: `$property must be at least $constraint1 characters` })
  @MaxLength(50, { message: `$property cannot be longer than $constraint1 characters` })
  @IsDefined({ message: '$property is required'})
  @Column({ type: 'varchar', unique: true, length: 50 })
  mediaTrend!: string;

  @Column({ type: 'uuid'})
  researchCategoryId!: string;

  @ManyToOne(type => ResearchCategory, researchCategory => researchCategory.mediaTrends)
  researchCategory!: ResearchCategory;
}