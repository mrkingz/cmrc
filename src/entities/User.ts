import {
  Entity, 
  Column,
  BeforeInsert,
} from 'typeorm';
import AbstractEntity from './AbsrtactEntity';
import { IsEmail, MinLength, MaxLength, IsDefined, IsNotEmpty, Allow, ValidateIf } from 'class-validator';
import { IsUniqueEmail } from '../validations/UserDecorators';

@Entity('users')
export default class User extends AbstractEntity {

  @MinLength(2, { message: `First name must be at least $constraint1 characters` })
  @MaxLength(30, { message: `First name cannot be longer than $constraint1 characters` })
  @IsDefined({ message: '$property is required'})
  @IsNotEmpty({ message: 'First name cannot be empty'})
  @Column({ type: 'varchar', length: 50 })
  firstName!: string;

  @IsDefined({ message: '$property is required'})
  @IsNotEmpty({ message: 'Last name cannot be empty'})
  @MinLength(2, { message: `Last name must be at least $constraint1 characters` })
  @MaxLength(30, { message: `Last name cannot be longer than $constraint1 characters` })
  @Column({ type: 'varchar', length: 50 })
  lastName!: string;

  @IsDefined({ message: '$property is required'})
  @Column({ type: 'varchar', unique: false, length: 50 })
  @IsEmail({}, { message: `Please, enter a valid email address` })
  // @IsUniqueEmail({ message: 'Email address has been used'})
  email!: string;

  @IsDefined({ message: '$property is required'})
  @Column({ type: 'varchar', length: 60 })
  @MinLength(8, { message: `Password must be at least $constraint1 characters` })
  password!: string

  @Column({ type: 'varchar', nullable: true, unique: true, length: 20 })
  phoneNumber!: string

  @Column({ type: 'varchar', nullable: true,  unique: true, length: 100 })
  photo!: string;


  @Column({ type: 'varchar', nullable: true, unique: true, length: 100 })
  rememberMeToken!: string;

  @Column({ type: 'boolean', default: false })
  isAdmin!: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  // Before insert subscriber
  @BeforeInsert()
  beforeInsert() {
    this.email = this.email.toLowerCase();
  }
};