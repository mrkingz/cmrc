import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import User from './User';
import AbstractEntity from './AbsrtactEntity';
import { MinLength, MaxLength, IsDefined, IsNotEmpty, IsEmail } from 'class-validator';

@Entity('testimonies')
export default class Testimony extends AbstractEntity {
  @MinLength(20, { message: `$property must be at least $constraint1 characters` })
  @MaxLength(200, { message: `$property cannot be longer than $constraint1 characters` })
  @IsDefined({ message: '$property is required' })
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
