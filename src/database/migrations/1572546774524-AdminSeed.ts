import {MigrationInterface, QueryRunner, getRepository} from "typeorm";
import userSeed from '../seeds/user.seeds';

export class AdminSeed1572546774524 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<any> {
		await getRepository('User').save(userSeed);
	}

	public async down(queryRunner: QueryRunner): Promise<any> {
		await getRepository('User').clear()
	}

}
