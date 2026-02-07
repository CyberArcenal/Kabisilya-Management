// ipc/worker/import_csv.ipc.js
//@ts-check

const csv = require("csv-parser");
const fs = require("fs");
const { createReadStream } = require("fs");
const Worker = require("../../../entities/Worker");
const UserActivity = require("../../../entities/UserActivity");
const { AppDataSource } = require("../../db/dataSource");
const { unlink } = require("fs/promises");

module.exports = async function importWorkersFromCSV(
  params = {},
  queryRunner = null,
) {
  let shouldRelease = false;

  if (!queryRunner) {
    // @ts-ignore
    queryRunner = AppDataSource.createQueryRunner();
    // @ts-ignore
    await queryRunner.connect();
    // @ts-ignore
    await queryRunner.startTransaction();
    shouldRelease = true;
  }

  try {
    // @ts-ignore
    const { filePath, hasHeader = true, delimiter = ",", userId } = params;

    if (!filePath) {
      return {
        status: false,
        message: "File path is required",
        data: null,
      };
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        status: false,
        message: `File not found: ${filePath}`,
        data: null,
      };
    }

    // @ts-ignore
    const workers = [];
    // @ts-ignore
    const errors = [];
    let rowNumber = 0;

    // Parse CSV file
    await new Promise((resolve, reject) => {
      createReadStream(filePath)
        .pipe(
          csv({
            headers: hasHeader,
            separator: delimiter,
            skipLines: hasHeader ? 0 : 0,
          }),
        )
        .on("data", (row) => {
          rowNumber++;

          try {
            // Map CSV columns to worker fields (removed financial fields)
            const workerData = {
              name: row.name || row.Name || row.NAME,
              contact:
                row.contact ||
                row.Contact ||
                row.CONTACT ||
                row.phone ||
                row.Phone,
              email: row.email || row.Email || row.EMAIL,
              address: row.address || row.Address || row.ADDRESS,
              status: (
                row.status ||
                row.Status ||
                row.STATUS ||
                "active"
              ).toLowerCase(),
              hireDate:
                row.hireDate || row.hire_date || row.HireDate || row.hiredate,
            };

            // Validate required fields
            if (!workerData.name) {
              errors.push(`Row ${rowNumber}: Name is required`);
              return;
            }

            // Validate status
            const validStatuses = [
              "active",
              "inactive",
              "on-leave",
              "terminated",
            ];
            if (
              workerData.status &&
              !validStatuses.includes(workerData.status)
            ) {
              errors.push(
                `Row ${rowNumber}: Invalid status '${workerData.status}'. Must be one of: ${validStatuses.join(", ")}`,
              );
              return;
            }

            // Validate email format if provided
            if (workerData.email && !isValidEmail(workerData.email)) {
              errors.push(
                `Row ${rowNumber}: Invalid email format '${workerData.email}'`,
              );
              return;
            }

            workers.push(workerData);
          } catch (error) {
            errors.push(
              // @ts-ignore
              `Row ${rowNumber}: Error parsing data - ${error.message}`,
            );
          }
        })
        .on("end", () => {
          resolve(undefined);
        })
        .on("error", (error) => {
          reject(error);
        });
    });

    if (errors.length > 0 && workers.length === 0) {
      return {
        status: false,
        message: "CSV parsing failed",
        // @ts-ignore
        data: { errors },
      };
    }

    // Check for duplicate emails in CSV
    const emailMap = new Map();
    // @ts-ignore
    const duplicateEmailsInCSV = [];

    // @ts-ignore
    workers.forEach((worker, index) => {
      if (worker.email) {
        if (emailMap.has(worker.email)) {
          duplicateEmailsInCSV.push({
            email: worker.email,
            rows: [emailMap.get(worker.email) + 1, index + 1],
          });
        } else {
          emailMap.set(worker.email, index);
        }
      }
    });

    if (duplicateEmailsInCSV.length > 0) {
      // @ts-ignore
      duplicateEmailsInCSV.forEach((dup) => {
        errors.push(
          `Duplicate email '${dup.email}' found in rows ${dup.rows.join(" and ")}`,
        );
      });
    }

    // Check for existing emails in database
    // @ts-ignore
    const workerRepository = queryRunner.manager.getRepository(Worker);
    const existingEmails = new Set();

    // @ts-ignore
    const emails = workers.map((w) => w.email).filter((email) => email);
    if (emails.length > 0) {
      const existingWorkers = await workerRepository
        .createQueryBuilder("worker")
        .where("worker.email IN (:...emails)", { emails })
        .getMany();

      // @ts-ignore
      existingWorkers.forEach((w) => existingEmails.add(w.email));
    }

    // Filter out workers with existing emails
    // @ts-ignore
    const workersToCreate = workers.filter(
      (worker) => !worker.email || !existingEmails.has(worker.email),
    );

    // @ts-ignore
    const workersWithExistingEmails = workers.filter(
      (worker) => worker.email && existingEmails.has(worker.email),
    );

    if (workersWithExistingEmails.length > 0) {
      errors.push(
        ...workersWithExistingEmails.map(
          (w) =>
            `Worker '${w.name}' (${w.email}): Email already exists in database`,
        ),
      );
    }

    // Create workers
    const createdWorkers = [];
    const skippedWorkers = [];
    const currentDate = new Date();

    for (const workerData of workersToCreate) {
      try {
        // @ts-ignore
        const worker = queryRunner.manager.create(Worker, {
          name: workerData.name,
          contact: workerData.contact || null,
          email: workerData.email || null,
          address: workerData.address || null,
          status: workerData.status || "active",
          hireDate: workerData.hireDate
            ? new Date(workerData.hireDate)
            : currentDate,
          createdAt: currentDate,
          updatedAt: currentDate,
        });

        // @ts-ignore
        const savedWorker = await queryRunner.manager.save(worker);
        createdWorkers.push(savedWorker);
      } catch (error) {
        skippedWorkers.push({
          name: workerData.name,
          email: workerData.email,
          // @ts-ignore
          error: error.message,
        });
        errors.push(
          // @ts-ignore
          `Failed to create worker '${workerData.name}': ${error.message}`,
        );
      }
    }

    // Log activity
    // @ts-ignore
    const activityRepo = queryRunner.manager.getRepository(UserActivity);
    const activity = activityRepo.create({
      user_id: userId,
      action: "import_workers_csv",
      description: `Imported ${createdWorkers.length} workers from CSV`,
      details: JSON.stringify({
        filePath,
        totalRows: rowNumber,
        created: createdWorkers.length,
        skipped:
          skippedWorkers.length +
          workersWithExistingEmails.length +
          duplicateEmailsInCSV.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : null, // Limit to 10 errors
      }),
      ip_address: "127.0.0.1",
      user_agent: "Kabisilya-Management-System",
      created_at: new Date(),
    });
    await activityRepo.save(activity);

    // Clean up uploaded file
    try {
      await unlink(filePath);
    } catch (cleanupError) {
      console.warn("Failed to delete temporary CSV file:", cleanupError);
    }

    if (shouldRelease) {
      // @ts-ignore
      await queryRunner.commitTransaction();
    }

    return {
      status: true,
      message: `CSV import completed: ${createdWorkers.length} workers created, ${skippedWorkers.length + workersWithExistingEmails.length} skipped`,
      data: {
        summary: {
          totalRows: rowNumber,
          successfullyImported: createdWorkers.length,
          skipped: skippedWorkers.length + workersWithExistingEmails.length,
          duplicateEmailsInCSV: duplicateEmailsInCSV.length,
          existingEmailsInDB: workersWithExistingEmails.length,
          creationErrors: skippedWorkers.length,
        },
        createdWorkers: createdWorkers.map((w) => ({
          id: w.id,
          name: w.name,
          email: w.email,
        })),
        errors: errors.length > 0 ? errors : null,
        sampleCSVFormat: {
          headers: [
            "name",
            "contact",
            "email",
            "address",
            "status",
            "hireDate",
          ],
          example: {
            name: "Juan Dela Cruz",
            contact: "09123456789",
            email: "juan@example.com",
            address: "Manila",
            status: "active",
            hireDate: "2024-01-15",
          },
        },
      },
    };
  } catch (error) {
    if (shouldRelease) {
      // @ts-ignore
      await queryRunner.rollbackTransaction();
    }
    console.error("Error in importWorkersFromCSV:", error);

    // Clean up uploaded file on error
    // @ts-ignore
    if (params.filePath && fs.existsSync(params.filePath)) {
      try {
        // @ts-ignore
        await unlink(params.filePath);
      } catch (cleanupError) {
        console.warn(
          "Failed to delete temporary CSV file on error:",
          cleanupError,
        );
      }
    }

    return {
      status: false,
      // @ts-ignore
      message: `Failed to import workers from CSV: ${error.message}`,
      data: null,
    };
  } finally {
    if (shouldRelease) {
      // @ts-ignore
      await queryRunner.release();
    }
  }
};

// @ts-ignore
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
