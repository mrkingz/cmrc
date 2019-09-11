import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
  PrimaryGeneratedColumn,
} from 'typeorm';

export default abstract class AbstractEntity extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Timestamp; 

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Timestamp;
};
