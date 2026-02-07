/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class InitSchema1770385218444 {
    name = 'InitSchema1770385218444'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_WORKER_NAME"`);
        await queryRunner.query(`DROP INDEX "IDX_WORKER_STATUS"`);
        await queryRunner.query(`CREATE TABLE "temporary_workers" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "contact" varchar, "email" varchar, "address" varchar, "status" varchar NOT NULL DEFAULT ('active'), "hireDate" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_87f2092ffaae628ef63547d2442" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "temporary_workers"("id", "name", "contact", "email", "address", "status", "hireDate", "createdAt", "updatedAt") SELECT "id", "name", "contact", "email", "address", "status", "hireDate", "createdAt", "updatedAt" FROM "workers"`);
        await queryRunner.query(`DROP TABLE "workers"`);
        await queryRunner.query(`ALTER TABLE "temporary_workers" RENAME TO "workers"`);
        await queryRunner.query(`CREATE INDEX "IDX_WORKER_NAME" ON "workers" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_WORKER_STATUS" ON "workers" ("status") `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_WORKER_STATUS"`);
        await queryRunner.query(`DROP INDEX "IDX_WORKER_NAME"`);
        await queryRunner.query(`ALTER TABLE "workers" RENAME TO "temporary_workers"`);
        await queryRunner.query(`CREATE TABLE "workers" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "contact" varchar, "email" varchar, "address" varchar, "status" varchar NOT NULL DEFAULT ('active'), "hireDate" datetime, "totalDebt" decimal(10,2) NOT NULL DEFAULT (0), "totalPaid" decimal(10,2) NOT NULL DEFAULT (0), "currentBalance" decimal(10,2) NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_87f2092ffaae628ef63547d2442" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "workers"("id", "name", "contact", "email", "address", "status", "hireDate", "createdAt", "updatedAt") SELECT "id", "name", "contact", "email", "address", "status", "hireDate", "createdAt", "updatedAt" FROM "temporary_workers"`);
        await queryRunner.query(`DROP TABLE "temporary_workers"`);
        await queryRunner.query(`CREATE INDEX "IDX_WORKER_STATUS" ON "workers" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_WORKER_NAME" ON "workers" ("name") `);
    }
}
