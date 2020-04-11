import bcrypt from 'bcryptjs';
import { Entity, Column, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import { IsEmail, MinLength, MaxLength, IsDefined, IsNotEmpty } from 'class-validator';

import Testimony from './Testimony';
import AbstractEntity from './AbsrtactEntity';

@Entity('users')
export default class User extends AbstractEntity {
  @MinLength(2, User.getMessage('minLength'))
  @MaxLength(50, User.getMessage('maxLength'))
  @IsDefined(User.getMessage('required'))
  @IsNotEmpty(User.getMessage('empty', 'First name'))
  @Column({ type: 'varchar', length: 50 })
  firstName!: string;

  @IsDefined(User.getMessage('required'))
  @IsNotEmpty(User.getMessage('empty', 'Last name'))
  @MinLength(2, User.getMessage('minLength'))
  @MaxLength(50, User.getMessage('maxLength'))
  @Column({ type: 'varchar', length: 50 })
  lastName!: string;

  @IsDefined(User.getMessage('required'))
  @Column({ type: 'varchar', unique: true })
  @IsEmail({}, User.getMessage('invalid', 'Email address'))
  email!: string;

  @IsDefined(User.getMessage('required'))
  @MinLength(8, User.getMessage('minLength'))
  @MaxLength(30, User.getMessage('maxLength'))
  @Column({ type: 'varchar', length: 60, select: false })
  password!: string;

  @Column({ type: 'varchar', nullable: true, unique: true, length: 100 })
  photo!: string;

  @Column({ type: 'varchar', nullable: true, unique: true, length: 100 })
  rememberMeToken!: string;

  @Column({ type: 'bigint', default: 0, select: false })
  resetStamp!: number;

  @Column({ type: 'boolean', default: false })
  isAdmin!: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @BeforeInsert()
  beforeInsert() {
    if (this.email && this.password) {
      this.email = this.email.toLowerCase();
      this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
    }
  }

  @BeforeUpdate()
  beforeUpdate() {
    // If password has been updated, it'll be unhashed with length <= 30
    // and the length must be less or equal to max password length; i.e., 30
    if (this.password && Number(this.resetStamp) > 0 && this.password.length <= 30) {
      this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
      this.resetStamp = 0;
    }
  }

  @OneToMany(() => Testimony, testimonies => testimonies.user)
  testimonies!: Array<Testimony>;
}
