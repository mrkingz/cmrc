import { Column, Entity, ManyToOne } from 'typeorm';
import AbstractEntity from './AbsrtactEntity';
import ResearchCategory from './ResearchCategory';
import { IsDefined, MaxLength, MinLength } from 'class-validator';

@Entity('mediaTrends')
export default class MediaTrend extends AbstractEntity {
  @MinLength(3, MediaTrend.getMessage('minLength'))
  @MaxLength(50, MediaTrend.getMessage('maxLength'))
  @IsDefined(MediaTrend.getMessage('required'))
  @Column({ type: 'varchar', unique: true, length: 50 })
  mediaTrend!: string;

  @Column({ type: 'uuid' })
  researchCategoryId!: string;

  @ManyToOne(() => ResearchCategory, researchCategory => researchCategory.mediaTrends)
  researchCategory!: ResearchCategory;
}
