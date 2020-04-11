import { 
  BaseEntity, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Timestamp, 
  PrimaryGeneratedColumn 
} from 'typeorm';

import Utility from '../../utilities/Utilities';

export default abstract class AbstractEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Timestamp;

  protected static getMessage(path: string, alias?: string): { message: string } {
    const str = new Utility().getMessage(`error.entity.${path}`);
    return { 
      message:  alias ? str.replace('$property', alias) : str 
    };
  }
}
