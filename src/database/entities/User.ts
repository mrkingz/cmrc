import bcrypt from 'bcryptjs';
import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsEmail, MinLength, MaxLength, IsDefined, IsNotEmpty } from 'class-validator';

import AbstractEntity from './AbsrtactEntity';

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
  @Column({ type: 'varchar', unique: true, length: 50 })
  @IsEmail({}, { message: `Please, enter a valid email address` })
  email!: string;

  @IsDefined({ message: '$property is required'})
  @Column({ type: 'varchar', length: 60 })
  @MinLength(8, { message: `Password must be at least $constraint1 characters` })
  @MaxLength(30, { message: `Password cannot be longer than $constraint1 characters` })
  password!: string;

  @Column({ type: 'varchar', nullable: true,  unique: true, length: 100 })
  photo!: string;


  @Column({ type: 'varchar', nullable: true, unique: true, length: 100 })
  rememberMeToken!: string;

  @Column({ type: 'bigint', default: 0 })
  resetStamp!: number;

  @Column({ type: 'boolean', default: false })
  isAdmin!: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @BeforeInsert()
  beforeInsert() {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
  }

  @BeforeUpdate()
  beforeUpdate() {
    // If password has been updated, it'll be unhashed
    // and the length must be less or equal to max password length; i.e., 30
    if (Number(this.resetStamp) > 0 && this.password.length <= 30) {
      this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
      this.resetStamp = 0;
    }
  }

  public com (password: string): boolean {
    console.log(password, this.password);
    return true;
  }
};