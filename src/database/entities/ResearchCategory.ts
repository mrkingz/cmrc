import { Entity, Column, OneToMany } from 'typeorm';

import AbstractEntity from './AbsrtactEntity';
import { MinLength, MaxLength, IsDefined } from 'class-validator';
import Discipline from './Discipline';
import PaperType from './PaperType';
import MediaTrend from './MediaTrend';
import Media from './MediaType';
import Domain from './Domain';

@Entity('researchCategories')
export default class ResearchCategory extends AbstractEntity {
  @MinLength(5, { message: `$property must be at least $constraint1 characters` })
  @MaxLength(50, { message: `$property cannot be longer than $constraint1 characters` })
  @IsDefined({ message: '$property is required' })
  @Column({ type: 'varchar', unique: true, length: 50 })
  categoryName?: string;

  @OneToMany(() => Discipline, discipline => discipline.researchCategory, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  disciplines!: Array<Discipline>;

  @OneToMany(() => PaperType, paperType => paperType.researchCategory, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  paperTypes!: Array<PaperType>;

  @OneToMany(() => MediaTrend, mediaTrend => mediaTrend.researchCategory, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  mediaTrends!: Array<MediaTrend>;

  @OneToMany(() => Media, media => media.researchCategory, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  mediaTypes!: Array<Media>;

  @OneToMany(() => Domain, domain => domain.researchCategory, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  domains!: Array<Domain>;
}
