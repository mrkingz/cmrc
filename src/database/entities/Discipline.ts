import { Column, Entity, ManyToOne } from 'typeorm';
import AbsrtactEntity from './AbsrtactEntity';
import ResearchCategory from './ResearchCategory';
import { IsDefined, MaxLength, MinLength } from 'class-validator';

@Entity('disciplines')
export default class Discipline extends AbsrtactEntity {
  @MinLength(3, { message: `$property must be at least $constraint1 characters` })
  @MaxLength(50, { message: `$property cannot be longer than $constraint1 characters` })
  @IsDefined({ message: '$property is required' })
  @Column({ type: 'varchar', unique: true, length: 50 })
  discipline!: string;

  @Column({ type: 'uuid' })
  researchCategoryId!: string;

  @ManyToOne(() => ResearchCategory, researchCategory => researchCategory.disciplines)
  researchCategory!: ResearchCategory;
}
