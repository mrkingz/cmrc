import {getRepository, MigrationInterface, QueryRunner} from 'typeorm';
import userSeed from '../seeds/user.seeds';

export class UserSeed1570475372204 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await getRepository('User').save(userSeed);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
