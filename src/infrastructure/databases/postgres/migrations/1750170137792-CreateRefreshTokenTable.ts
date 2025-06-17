import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRefreshTokenTable1750170137792 implements MigrationInterface {
    name = 'CreateRefreshTokenTable1750170137792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "refresh_token" character varying NOT NULL, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_068c1346f603dca1702fb893c0" ON "refresh_tokens" ("refresh_token") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_068c1346f603dca1702fb893c0"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}
