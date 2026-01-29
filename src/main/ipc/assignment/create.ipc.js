// // src/ipc/assignment/create/create.ipc.js
// //@ts-check
// const { In } = require("typeorm");
// const { AppDataSource } = require("../../db/dataSource");
// const Assignment = require("../../../entities/Assignment");
// const Worker = require("../../../entities/Worker");
// const Pitak = require("../../../entities/Pitak");

// /**
//  * Create new assignments for multiple workers
//  * - If luwangCount is 0 or not provided, compute from pitak.totalLuwang / workerCount
//  * - Robust date validation (normalizes to YYYY-MM-DD to avoid timezone issues)
//  * - TypeORM v0.3+ patterns (In, relation objects)
//  *
//  * @param {Object} params - { workerIds: number[], pitakId: number, luwangCount?: number, assignmentDate: string, notes?: string, userId?: number }
//  * @param {import("typeorm").QueryRunner} [externalQueryRunner] - Optional transaction query runner
//  * @returns {Promise<Object>} Response object
//  */
//
// module.exports = async (params = {}, externalQueryRunner = null) => {
//   let queryRunner = externalQueryRunner;
//   let shouldRelease = false;

//   if (!queryRunner) {
//     queryRunner = AppDataSource.createQueryRunner();
//
//     await queryRunner.connect();
//
//     await queryRunner.startTransaction();
//     shouldRelease = true;
//   }

//   try {
//     const {
//
//       workerIds,
//
//       pitakId,
//
//       luwangCount,
//
//       assignmentDate,
//
//       notes,
//
//
//       userId,
//     } = params;

//     // Basic validation
//     if (
//       !workerIds ||
//       !Array.isArray(workerIds) ||
//       workerIds.length === 0 ||
//       !pitakId ||
//       !assignmentDate
//     ) {
//       return {
//         status: false,
//         message:
//           "Missing required fields: workerIds (array with at least one worker), pitakId, and assignmentDate are required",
//         data: null,
//       };
//     }

//     // Dedupe and normalize worker IDs
//     const uniqueWorkerIds = [
//       ...new Set(workerIds.map((id) => Number(id))),
//     ].filter(Boolean);
//     if (uniqueWorkerIds.length === 0) {
//       return {
//         status: false,
//         message: "No valid worker IDs provided",
//         data: null,
//       };
//     }

//     // Normalize assignment date to YYYY-MM-DD to avoid timezone issues
//     const normalizeToDateString = (/** @type {string | number | Date} */ d) => {
//       const dt = new Date(d);
//       if (Number.isNaN(dt.getTime())) return null;
//       return dt.toISOString().split("T")[0];
//     };

//     const assignmentDateStr = normalizeToDateString(assignmentDate);
//     if (!assignmentDateStr) {
//       return { status: false, message: "Invalid assignmentDate", data: null };
//     }

//     const todayStr = new Date().toISOString().split("T")[0];
//     if (assignmentDateStr > todayStr) {
//       return {
//         status: false,
//         message: "Assignment date cannot be in the future",
//         data: null,
//       };
//     }

//     // Convert normalized date back to Date object at local midnight for storage/queries
//     const assignmentDateObj = new Date(`${assignmentDateStr}T00:00:00`);

//     // Repositories
//     const pitakRepo = queryRunner.manager.getRepository(Pitak);
//     const workerRepo = queryRunner.manager.getRepository(Worker);
//     const assignmentRepo = queryRunner.manager.getRepository(Assignment);

//     // Validate pitak exists and fetch totalLuwang
//     const pitak = await pitakRepo.findOne({ where: { id: pitakId } });
//     if (!pitak) {
//       return { status: false, message: "Pitak not found", data: null };
//     }

//     if (pitak.status === "completed") {
//       return {
//         status: false,
//         message: `Pitak ${pitakId} is already completed. No new assignments allowed.`,
//         data: null,
//       };
//     }

//     // Validate workers exist
//     const workers = await workerRepo.findBy({ id: In(uniqueWorkerIds) });
//     if (workers.length !== uniqueWorkerIds.length) {
//       const foundIds = workers.map((w) => w.id);
//       const missingIds = uniqueWorkerIds.filter((id) => !foundIds.includes(id));
//       return {
//         status: false,
//         message: `Some workers not found: ${missingIds.join(", ")}`,
//         data: null,
//       };
//     }

//     // Check for inactive workers
//     const inactiveWorkers = workers.filter((w) => w.status !== "active");
//     if (inactiveWorkers.length > 0) {
//       return {
//         status: false,
//         message: `Some workers are not active: ${inactiveWorkers.map((w) => `${w.id} (${w.status})`).join(", ")}`,
//         data: null,
//       };
//     }

//     // 🔑 NEW: Check existing active assignments for the same pitak (skip instead of error)
//     const existingAssignmentsInPitak = await assignmentRepo.find({
//       where: {
//
//         worker: { id: In(uniqueWorkerIds) },
//         pitak: { id: pitakId },
//         status: "active",
//       },
//       relations: ["worker", "pitak"],
//     });

//
//     let skippedWorkers = existingAssignmentsInPitak
//       .map((a) => a.worker?.id)
//       .filter(Boolean);

//     // Filter out skipped workers
//     const workersToAssign = uniqueWorkerIds.filter(
//       (id) => !skippedWorkers.includes(id),
//     );

//     if (workersToAssign.length === 0) {
//       return {
//         status: true,
//         message: `All selected workers are already assigned to pitak ${pitakId}`,
//         data: {
//           assignments: [],
//           summary: {
//             totalWorkers: 0,
//             totalLuWangCount: 0,
//             assignmentDate: assignmentDateStr,
//             pitakId,
//             skippedWorkers,
//           },
//         },
//       };
//     }

//     // Compute luwangCount per worker
//     const workerCount = workersToAssign.length;
//     let luwangCountPerWorker = 0.0;

//     if (typeof luwangCount === "number" && luwangCount > 0) {
//       luwangCountPerWorker = parseFloat((luwangCount / workerCount).toFixed(2));
//     } else {
//       const pitakTotalRaw = pitak.totalLuwang ?? 0;
//
//       const pitakTotal = parseFloat(pitakTotalRaw) || 0;
//       if (pitakTotal > 0) {
//         luwangCountPerWorker = parseFloat(
//           (pitakTotal / workerCount).toFixed(2),
//         );
//       } else {
//         luwangCountPerWorker = 0.0;
//       }
//     }

//     // Create assignment entities (use relation objects)
//     const assignmentsToSave = workersToAssign.map((workerId) =>
//       assignmentRepo.create({
//
//         worker: { id: workerId },
//         pitak: { id: pitakId },
//         luwangCount: luwangCountPerWorker,
//         assignmentDate: assignmentDateObj,
//         status: "active",
//         notes: notes || null,
//       }),
//     );

//     const savedAssignments = await assignmentRepo.save(assignmentsToSave);

//     // Format response (normalize types for frontend)
//     const formattedAssignments = savedAssignments.map((a) => ({
//       id: a.id,
//
//       workerId: a.worker?.id ?? null,
//
//       pitakId: a.pitak?.id ?? null,
//       luwangCount:
//         typeof a.luwangCount === "string"
//           ? parseFloat(a.luwangCount)
//           : (a.luwangCount ?? 0),
//
//       assignmentDate: a.assignmentDate
//         ? a.assignmentDate.toISOString().split("T")[0]
//         : assignmentDateStr,
//       status: a.status,
//       notes: a.notes,
//
//       createdAt: a.createdAt ? a.createdAt.toISOString() : undefined,
//
//       updatedAt: a.updatedAt ? a.updatedAt.toISOString() : undefined,
//     }));

//     if (shouldRelease) {
//       await queryRunner.commitTransaction();
//     }

//     return {
//       status: true,
//       message: `${formattedAssignments.length} assignment(s) created successfully. ${skippedWorkers.length > 0 ? `Skipped ${skippedWorkers.length} already-assigned worker(s).` : ""}`,
//       data: {
//         assignments: formattedAssignments,
//         summary: {
//           totalWorkers: formattedAssignments.length,
//
//           totalLuWangCount: formattedAssignments.reduce(
//             (sum, x) => sum + (x.luwangCount || 0),
//             0,
//           ),
//           assignmentDate: assignmentDateStr,
//           pitakId,
//           skippedWorkers,
//         },
//       },
//     };
//   } catch (error) {
//     if (shouldRelease) {
//       await queryRunner.rollbackTransaction();
//     }
//     console.error("Error creating assignments:", error);
//     return {
//       status: false,
//
//       message: `Failed to create assignments: ${error?.message || error}`,
//       data: null,
//     };
//   } finally {
//     if (shouldRelease) {
//       await queryRunner.release();
//     }
//   }
// };

// src/ipc/assignment/create/create.ipc.js
//@ts-check
const { AppDataSource } = require("../../db/dataSource");
const Assignment = require("../../../entities/Assignment");
const Worker = require("../../../entities/Worker");
const Pitak = require("../../../entities/Pitak");
const {
  validatePitak,
  validateWorkers,
  findAlreadyAssigned,
} = require("./utils/assignmentUtils");

/**
 * Create new assignments for multiple workers
 * - If luwangCount is 0 or not provided, compute from pitak.totalLuwang / workerCount
 * - Robust date validation (normalizes to YYYY-MM-DD to avoid timezone issues)
 * - TypeORM v0.3+ patterns (relation objects)
 *
 * @param {Object} params - { workerIds: number[], pitakId: number, luwangCount?: number, assignmentDate: string, notes?: string, userId?: number }
 * @param {import("typeorm").QueryRunner} [externalQueryRunner] - Optional transaction query runner
 * @returns {Promise<Object>} Response object
 */

// @ts-ignore
module.exports = async (params = {}, externalQueryRunner = null) => {
  let queryRunner = externalQueryRunner;
  let shouldRelease = false;

  if (!queryRunner) {
    queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();
    shouldRelease = true;
  }

  try {
    const {
      // @ts-ignore
      workerIds,

      // @ts-ignore
      pitakId,

      // @ts-ignore
      luwangCount,

      // @ts-ignore
      assignmentDate,

      // @ts-ignore
      notes,

      // @ts-ignore
      userId,
    } = params;

    // Basic validation
    if (
      !workerIds ||
      !Array.isArray(workerIds) ||
      workerIds.length === 0 ||
      !pitakId ||
      !assignmentDate
    ) {
      return {
        status: false,
        message:
          "Missing required fields: workerIds (array with at least one worker), pitakId, and assignmentDate are required",
        data: null,
      };
    }

    // Dedupe and normalize worker IDs
    const uniqueWorkerIds = [
      ...new Set(workerIds.map((id) => Number(id))),
    ].filter(Boolean);
    if (uniqueWorkerIds.length === 0) {
      return {
        status: false,
        message: "No valid worker IDs provided",
        data: null,
      };
    }

    // Normalize assignment date to YYYY-MM-DD

    const normalizeToDateString = (/** @type {string | number | Date} */ d) => {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return null;
      return dt.toISOString().split("T")[0];
    };

    const assignmentDateStr = normalizeToDateString(assignmentDate);
    if (!assignmentDateStr) {
      return { status: false, message: "Invalid assignmentDate", data: null };
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (assignmentDateStr > todayStr) {
      return {
        status: false,
        message: "Assignment date cannot be in the future",
        data: null,
      };
    }

    const assignmentDateObj = new Date(`${assignmentDateStr}T00:00:00`);

    // Repositories
    const pitakRepo = queryRunner.manager.getRepository(Pitak);
    const workerRepo = queryRunner.manager.getRepository(Worker);
    const assignmentRepo = queryRunner.manager.getRepository(Assignment);

    // ✅ Validate pitak (existence + status)
    const pitakCheck = await validatePitak(pitakRepo, pitakId);
    if (!pitakCheck.valid) {
      return { status: false, message: pitakCheck.message, data: null };
    }
    const pitak = pitakCheck.pitak;

    // ✅ Validate workers (existence + active status)
    const workerCheck = await validateWorkers(workerRepo, uniqueWorkerIds);
    if (!workerCheck.valid) {
      return { status: false, message: workerCheck.message, data: null };
    }

    // @ts-ignore
    const workers = workerCheck.workers;

    // ✅ Skip workers already assigned to this pitak
    const skippedWorkers = await findAlreadyAssigned(
      assignmentRepo,
      uniqueWorkerIds,
      pitakId,
    );
    const workersToAssign = uniqueWorkerIds.filter(
      (id) => !skippedWorkers.includes(id),
    );

    if (workersToAssign.length === 0) {
      return {
        status: true,
        message: `All selected workers are already assigned to pitak ${pitakId}`,
        data: {
          assignments: [],
          summary: {
            totalWorkers: 0,
            totalLuWangCount: 0,
            assignmentDate: assignmentDateStr,
            pitakId,
            skippedWorkers,
          },
        },
      };
    }

    // Compute luwangCount per worker
    const workerCount = workersToAssign.length;
    let luwangCountPerWorker = 0.0;

    if (typeof luwangCount === "number" && luwangCount > 0) {
      luwangCountPerWorker = parseFloat((luwangCount / workerCount).toFixed(2));
    } else {
      const pitakTotalRaw = pitak.totalLuwang ?? 0;
      const pitakTotal = parseFloat(pitakTotalRaw) || 0;
      if (pitakTotal > 0) {
        luwangCountPerWorker = parseFloat(
          (pitakTotal / workerCount).toFixed(2),
        );
      } else {
        luwangCountPerWorker = 0.0;
      }
    }

    // Create assignment entities
    const assignmentsToSave = workersToAssign.map((workerId) =>
      assignmentRepo.create({
        // @ts-ignore
        worker: { id: workerId },
        pitak: { id: pitakId },
        luwangCount: luwangCountPerWorker,
        assignmentDate: assignmentDateObj,
        status: "active",
        notes: notes || null,
      }),
    );

    const savedAssignments = await assignmentRepo.save(assignmentsToSave);

    // Format response
    const formattedAssignments = savedAssignments.map((a) => ({
      id: a.id,

      // @ts-ignore
      workerId: a.worker?.id ?? null,

      // @ts-ignore
      pitakId: a.pitak?.id ?? null,
      luwangCount:
        typeof a.luwangCount === "string"
          ? parseFloat(a.luwangCount)
          : (a.luwangCount ?? 0),

      assignmentDate: a.assignmentDate
        // @ts-ignore
        ? a.assignmentDate.toISOString().split("T")[0]
        : assignmentDateStr,
      status: a.status,
      notes: a.notes,

      // @ts-ignore
      createdAt: a.createdAt ? a.createdAt.toISOString() : undefined,

      // @ts-ignore
      updatedAt: a.updatedAt ? a.updatedAt.toISOString() : undefined,
    }));

    if (shouldRelease) {
      await queryRunner.commitTransaction();
    }

    return {
      status: true,
      message: `${formattedAssignments.length} assignment(s) created successfully. ${skippedWorkers.length > 0 ? `Skipped ${skippedWorkers.length} already-assigned worker(s).` : ""}`,
      data: {
        assignments: formattedAssignments,
        summary: {
          totalWorkers: formattedAssignments.length,

          totalLuWangCount: formattedAssignments.reduce(
            // @ts-ignore
            (sum, x) => sum + (x.luwangCount || 0),
            0,
          ),
          assignmentDate: assignmentDateStr,
          pitakId,
          skippedWorkers,
        },
      },
    };
  } catch (error) {
    if (shouldRelease) {
      await queryRunner.rollbackTransaction();
    }
    console.error("Error creating assignments:", error);
    return {
      status: false,

      // @ts-ignore
      message: `Failed to create assignments: ${error?.message || error}`,
      data: null,
    };
  } finally {
    if (shouldRelease) {
      await queryRunner.release();
    }
  }
};
