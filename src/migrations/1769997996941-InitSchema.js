/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class InitSchema1769997996941 {
    name = 'InitSchema1769997996941'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_SESSION"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_WORKER"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_DATE"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_STATUS"`);
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_PITAK_WORKER_SESSION"`);
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_ASSIGNMENT"`);
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_IDEMPOTENCY_KEY"`);
        await queryRunner.query(`CREATE TABLE "temporary_payments" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "grossPay" decimal(10,2) NOT NULL DEFAULT (0), "manualDeduction" decimal(10,2) DEFAULT (0), "netPay" decimal(10,2) NOT NULL DEFAULT (0), "status" varchar NOT NULL DEFAULT ('pending'), "paymentDate" datetime, "paymentMethod" varchar, "referenceNumber" varchar, "periodStart" datetime, "periodEnd" datetime, "totalDebtDeduction" decimal(10,2) NOT NULL DEFAULT (0), "otherDeductions" decimal(10,2) NOT NULL DEFAULT (0), "deductionBreakdown" json, "notes" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "workerId" integer, "pitakId" integer, "sessionId" integer NOT NULL, "idempotencyKey" varchar, "assignmentId" integer, CONSTRAINT "UQ_b1ccfcfabdda075c2742c0060c6" UNIQUE ("referenceNumber"), CONSTRAINT "FK_c96a63d98681cc603f7300deeb5" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_8bedf6595ab5a0ea80a6e008cff" FOREIGN KEY ("pitakId") REFERENCES "pitaks" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_a03c9d5254fca3435262af9721c" FOREIGN KEY ("workerId") REFERENCES "workers" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_dd4f81603d259c9f00994f8bbec" FOREIGN KEY ("assignmentId") REFERENCES "assignments" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_payments"("id", "grossPay", "manualDeduction", "netPay", "status", "paymentDate", "paymentMethod", "referenceNumber", "periodStart", "periodEnd", "totalDebtDeduction", "otherDeductions", "deductionBreakdown", "notes", "createdAt", "updatedAt", "workerId", "pitakId", "sessionId", "idempotencyKey", "assignmentId") SELECT "id", "grossPay", "manualDeduction", "netPay", "status", "paymentDate", "paymentMethod", "referenceNumber", "periodStart", "periodEnd", "totalDebtDeduction", "otherDeductions", "deductionBreakdown", "notes", "createdAt", "updatedAt", "workerId", "pitakId", "sessionId", "idempotencyKey", "assignmentId" FROM "payments"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`ALTER TABLE "temporary_payments" RENAME TO "payments"`);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_SESSION" ON "payments" ("sessionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_WORKER" ON "payments" ("workerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_DATE" ON "payments" ("paymentDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_STATUS" ON "payments" ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_PITAK_WORKER_SESSION" ON "payments" ("pitakId", "workerId", "sessionId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_ASSIGNMENT" ON "payments" ("assignmentId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_IDEMPOTENCY_KEY" ON "payments" ("idempotencyKey") `);
        await queryRunner.query(`CREATE TABLE "temporary_bukids" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "location" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "sessionId" integer, "notes" varchar, CONSTRAINT "FK_70b48b86b0daf745c9181d3d1a6" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_bukids"("id", "name", "status", "location", "createdAt", "updatedAt", "sessionId") SELECT "id", "name", "status", "location", "createdAt", "updatedAt", "sessionId" FROM "bukids"`);
        await queryRunner.query(`DROP TABLE "bukids"`);
        await queryRunner.query(`ALTER TABLE "temporary_bukids" RENAME TO "bukids"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_SESSION"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_WORKER"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_DATE"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_STATUS"`);
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_PITAK_WORKER_SESSION"`);
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_ASSIGNMENT"`);
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_IDEMPOTENCY_KEY"`);
        await queryRunner.query(`CREATE TABLE "temporary_payments" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "grossPay" decimal(10,2) NOT NULL DEFAULT (0), "manualDeduction" decimal(10,2) DEFAULT (0), "netPay" decimal(10,2) NOT NULL DEFAULT (0), "status" varchar NOT NULL DEFAULT ('pending'), "paymentDate" datetime, "paymentMethod" varchar, "referenceNumber" varchar, "periodStart" datetime, "periodEnd" datetime, "totalDebtDeduction" decimal(10,2) NOT NULL DEFAULT (0), "otherDeductions" decimal(10,2) NOT NULL DEFAULT (0), "deductionBreakdown" json, "notes" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "workerId" integer, "pitakId" integer, "sessionId" integer NOT NULL, "idempotencyKey" varchar, "assignmentId" integer, CONSTRAINT "UQ_b1ccfcfabdda075c2742c0060c6" UNIQUE ("referenceNumber"), CONSTRAINT "FK_c96a63d98681cc603f7300deeb5" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_8bedf6595ab5a0ea80a6e008cff" FOREIGN KEY ("pitakId") REFERENCES "pitaks" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_a03c9d5254fca3435262af9721c" FOREIGN KEY ("workerId") REFERENCES "workers" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_dd4f81603d259c9f00994f8bbec" FOREIGN KEY ("assignmentId") REFERENCES "assignments" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_payments"("id", "grossPay", "manualDeduction", "netPay", "status", "paymentDate", "paymentMethod", "referenceNumber", "periodStart", "periodEnd", "totalDebtDeduction", "otherDeductions", "deductionBreakdown", "notes", "createdAt", "updatedAt", "workerId", "pitakId", "sessionId", "idempotencyKey", "assignmentId") SELECT "id", "grossPay", "manualDeduction", "netPay", "status", "paymentDate", "paymentMethod", "referenceNumber", "periodStart", "periodEnd", "totalDebtDeduction", "otherDeductions", "deductionBreakdown", "notes", "createdAt", "updatedAt", "workerId", "pitakId", "sessionId", "idempotencyKey", "assignmentId" FROM "payments"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`ALTER TABLE "temporary_payments" RENAME TO "payments"`);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_SESSION" ON "payments" ("sessionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_WORKER" ON "payments" ("workerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_DATE" ON "payments" ("paymentDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_STATUS" ON "payments" ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_PITAK_WORKER_SESSION" ON "payments" ("pitakId", "workerId", "sessionId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_ASSIGNMENT" ON "payments" ("assignmentId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_IDEMPOTENCY_KEY" ON "payments" ("idempotencyKey") `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_IDEMPOTENCY_KEY"`);
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_ASSIGNMENT"`);
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_PITAK_WORKER_SESSION"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_STATUS"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_DATE"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_WORKER"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_SESSION"`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME TO "temporary_payments"`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "grossPay" decimal(10,2) NOT NULL DEFAULT (0), "manualDeduction" decimal(10,2) DEFAULT (0), "netPay" decimal(10,2) NOT NULL DEFAULT (0), "status" varchar NOT NULL DEFAULT ('pending'), "paymentDate" datetime, "paymentMethod" varchar, "referenceNumber" varchar, "periodStart" datetime, "periodEnd" datetime, "totalDebtDeduction" decimal(10,2) NOT NULL DEFAULT (0), "otherDeductions" decimal(10,2) NOT NULL DEFAULT (0), "deductionBreakdown" json, "notes" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "workerId" integer, "pitakId" integer, "sessionId" integer NOT NULL, "idempotencyKey" varchar, "assignmentId" integer, CONSTRAINT "UQ_b1ccfcfabdda075c2742c0060c6" UNIQUE ("referenceNumber"), CONSTRAINT "FK_c96a63d98681cc603f7300deeb5" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_8bedf6595ab5a0ea80a6e008cff" FOREIGN KEY ("pitakId") REFERENCES "pitaks" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_a03c9d5254fca3435262af9721c" FOREIGN KEY ("workerId") REFERENCES "workers" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_dd4f81603d259c9f00994f8bbec" FOREIGN KEY ("assignmentId") REFERENCES "assignments" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "payments"("id", "grossPay", "manualDeduction", "netPay", "status", "paymentDate", "paymentMethod", "referenceNumber", "periodStart", "periodEnd", "totalDebtDeduction", "otherDeductions", "deductionBreakdown", "notes", "createdAt", "updatedAt", "workerId", "pitakId", "sessionId", "idempotencyKey", "assignmentId") SELECT "id", "grossPay", "manualDeduction", "netPay", "status", "paymentDate", "paymentMethod", "referenceNumber", "periodStart", "periodEnd", "totalDebtDeduction", "otherDeductions", "deductionBreakdown", "notes", "createdAt", "updatedAt", "workerId", "pitakId", "sessionId", "idempotencyKey", "assignmentId" FROM "temporary_payments"`);
        await queryRunner.query(`DROP TABLE "temporary_payments"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_IDEMPOTENCY_KEY" ON "payments" ("idempotencyKey") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_ASSIGNMENT" ON "payments" ("assignmentId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_PITAK_WORKER_SESSION" ON "payments" ("pitakId", "workerId", "sessionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_STATUS" ON "payments" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_DATE" ON "payments" ("paymentDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_WORKER" ON "payments" ("workerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_SESSION" ON "payments" ("sessionId") `);
        await queryRunner.query(`ALTER TABLE "bukids" RENAME TO "temporary_bukids"`);
        await queryRunner.query(`CREATE TABLE "bukids" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "location" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "sessionId" integer, CONSTRAINT "FK_70b48b86b0daf745c9181d3d1a6" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "bukids"("id", "name", "status", "location", "createdAt", "updatedAt", "sessionId") SELECT "id", "name", "status", "location", "createdAt", "updatedAt", "sessionId" FROM "temporary_bukids"`);
        await queryRunner.query(`DROP TABLE "temporary_bukids"`);
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_IDEMPOTENCY_KEY"`);
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_ASSIGNMENT"`);
        await queryRunner.query(`DROP INDEX "UX_PAYMENTS_PITAK_WORKER_SESSION"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_STATUS"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_DATE"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_WORKER"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENT_SESSION"`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME TO "temporary_payments"`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "grossPay" decimal(10,2) NOT NULL DEFAULT (0), "manualDeduction" decimal(10,2) DEFAULT (0), "netPay" decimal(10,2) NOT NULL DEFAULT (0), "status" varchar NOT NULL DEFAULT ('pending'), "paymentDate" datetime, "paymentMethod" varchar, "referenceNumber" varchar, "periodStart" datetime, "periodEnd" datetime, "totalDebtDeduction" decimal(10,2) NOT NULL DEFAULT (0), "otherDeductions" decimal(10,2) NOT NULL DEFAULT (0), "deductionBreakdown" json, "notes" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "workerId" integer, "pitakId" integer, "sessionId" integer NOT NULL, "idempotencyKey" varchar, "assignmentId" integer, CONSTRAINT "UQ_b1ccfcfabdda075c2742c0060c6" UNIQUE ("referenceNumber"), CONSTRAINT "FK_c96a63d98681cc603f7300deeb5" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_8bedf6595ab5a0ea80a6e008cff" FOREIGN KEY ("pitakId") REFERENCES "pitaks" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_a03c9d5254fca3435262af9721c" FOREIGN KEY ("workerId") REFERENCES "workers" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_dd4f81603d259c9f00994f8bbec" FOREIGN KEY ("assignmentId") REFERENCES "assignments" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "payments"("id", "grossPay", "manualDeduction", "netPay", "status", "paymentDate", "paymentMethod", "referenceNumber", "periodStart", "periodEnd", "totalDebtDeduction", "otherDeductions", "deductionBreakdown", "notes", "createdAt", "updatedAt", "workerId", "pitakId", "sessionId", "idempotencyKey", "assignmentId") SELECT "id", "grossPay", "manualDeduction", "netPay", "status", "paymentDate", "paymentMethod", "referenceNumber", "periodStart", "periodEnd", "totalDebtDeduction", "otherDeductions", "deductionBreakdown", "notes", "createdAt", "updatedAt", "workerId", "pitakId", "sessionId", "idempotencyKey", "assignmentId" FROM "temporary_payments"`);
        await queryRunner.query(`DROP TABLE "temporary_payments"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_IDEMPOTENCY_KEY" ON "payments" ("idempotencyKey") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_ASSIGNMENT" ON "payments" ("assignmentId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UX_PAYMENTS_PITAK_WORKER_SESSION" ON "payments" ("pitakId", "workerId", "sessionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_STATUS" ON "payments" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_DATE" ON "payments" ("paymentDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_WORKER" ON "payments" ("workerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENT_SESSION" ON "payments" ("sessionId") `);
    }
}
