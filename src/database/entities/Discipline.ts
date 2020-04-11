import { Column, Entity, ManyToOne } from 'typeorm';
import AbsrtactEntity from './AbsrtactEntity';
import ResearchCategory from './ResearchCategory';
import { IsDefined, MaxLength, MinLength } from 'class-validator';

@Entity('disciplines')
export default class Discipline extends AbsrtactEntity {
  @MinLength(3, Discipline.getMessage('minLength'))
  @MaxLength(50, Discipline.getMessage('maxLength'))
  @IsDefined(Discipline.getMessage('required'))
  @Column({ type: 'varchar', unique: true, length: 50 })
  discipline!: string;

  @Column({ type: 'uuid' })
  researchCategoryId!: string;

  @ManyToOne(() => ResearchCategory, researchCategory => researchCategory.disciplines)
  researchCategory!: ResearchCategory;
}
