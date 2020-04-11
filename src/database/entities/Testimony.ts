import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import User from './User';
import AbstractEntity from './AbsrtactEntity';
import { MinLength, MaxLength, IsDefined, IsNotEmpty, IsEmail } from 'class-validator';

@Entity('testimonies')
export default class Testimony extends AbstractEntity {
  @MinLength(20, Testimony.getMessage('minLength'))
  @MaxLength(200, Testimony.getMessage('maxLength'))
  @IsDefined(Testimony.getMessage('required'))
  @Column({ type: 'varchar', length: 200 })
  testimony!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'boolean', default: false })
  approved!: boolean;

  @ManyToOne(() => User, user => user.testimonies, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user!: User;
}
