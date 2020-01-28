import { Entity, Column, } from 'typeorm';

import AbstractEntity from './AbsrtactEntity';
import { MinLength, MaxLength, IsDefined } from 'class-validator';

@Entity('orderTypes')
export default class OrderType extends AbstractEntity {

  @MinLength(4, { message: `$property must be at least $constraint1 characters` })
  @MaxLength(50, { message: `$property cannot be longer than $constraint1 characters` })
  @IsDefined({ message: '$property is required'})
  @Column({ type: 'varchar', length: 50 })
  orderType?: string;

}

