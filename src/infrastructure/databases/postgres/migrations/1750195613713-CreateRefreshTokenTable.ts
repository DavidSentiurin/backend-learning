import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokenTable1750195613713
  implements MigrationInterface
{
  name = 'CreateRefreshTokenTable1750195613713';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "refresh_tokens" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "refresh_token" character varying NOT NULL, 
            "expires_at" TIMESTAMP NOT NULL, 
            "user_id" uuid, 
            CONSTRAINT "REL_610102b60fea1455310ccd299d" UNIQUE ("user_id"), 
            CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")
        )`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
