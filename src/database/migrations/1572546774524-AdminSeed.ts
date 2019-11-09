import {MigrationInterface, QueryRunner, getRepository} from "typeorm";
import adminSeed from '../seeds/admin';

export default class AdminSeed1572546774524 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<any> {
		await getRepository('User').save(adminSeed);
	}

	public async down(queryRunner: QueryRunner): Promise<any> {
		await queryRunner.query(`DELETE FROM users WHERE email = '${adminSeed.email}'`)
	}
}
