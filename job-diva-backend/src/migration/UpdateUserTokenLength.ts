import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTokenLength implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE user MODIFY COLUMN linkedInAccessToken VARCHAR(1000)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE user MODIFY COLUMN linkedInAccessToken VARCHAR(255)`
        );
    }
} 