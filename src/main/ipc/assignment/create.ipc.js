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
const { farmSessionDefaultSessionId } = require("../../../utils/system");

module.exports = async (params = {}, externalQueryRunner = null) => {
  let queryRunner = externalQueryRunner;
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
    const { workerIds, pitakId, assignmentDate, notes } = params;

    const sessionId = await farmSessionDefaultSessionId();
    if (!sessionId || sessionId === 0) {
      return {
        status: false,
        message: "No default session configured.",
        data: null,
      };
    }

    if (
      !workerIds ||
      !Array.isArray(workerIds) ||
      workerIds.length === 0 ||
      !pitakId ||
      !assignmentDate
    ) {
      return { status: false, message: "Missing required fields", data: null };
    }

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

    const assignmentDateStr = new Date(assignmentDate)
      .toISOString()
      .split("T")[0];
    const assignmentDateObj = new Date(`${assignmentDateStr}T00:00:00`);

    // @ts-ignore
    const pitakRepo = queryRunner.manager.getRepository(Pitak);
    // @ts-ignore
    const workerRepo = queryRunner.manager.getRepository(Worker);
    // @ts-ignore
    const assignmentRepo = queryRunner.manager.getRepository(Assignment);

    const pitakCheck = await validatePitak(pitakRepo, pitakId);
    if (!pitakCheck.valid)
      return { status: false, message: pitakCheck.message, data: null };
    const pitak = pitakCheck.pitak;

    const workerCheck = await validateWorkers(workerRepo, uniqueWorkerIds);
    if (!workerCheck.valid)
      return { status: false, message: workerCheck.message, data: null };

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
        message: "All workers already assigned",
        data: { assignments: [], summary: {} },
      };
    }

    // ✅ Query existing assignments
    const existingAssignments = await assignmentRepo.find({
      where: { pitak: { id: pitakId }, assignmentDate: assignmentDateObj },
      relations: ["worker", "pitak"],
    });

    const completedAssignments = existingAssignments.filter(
      // @ts-ignore
      (a) => a.status === "completed",
    );
    const activeAssignments = existingAssignments.filter(
      // @ts-ignore
      (a) => a.status === "active",
    );

    const lockedLuWang = completedAssignments.reduce(
      // @ts-ignore
      (sum, a) => sum + parseFloat(a.luwangCount || 0),
      0,
    );
    const pitakTotal = parseFloat(pitak.totalLuwang) || 0;
    const remainingLuWang = pitakTotal - lockedLuWang;

    if (remainingLuWang <= 0) {
      return {
        status: false,
        message: "Pitak fully utilized by completed assignments",
        data: null,
      };
    }

    const totalAssignableCount =
      activeAssignments.length + workersToAssign.length;
    const newShare = parseFloat(
      (remainingLuWang / totalAssignableCount).toFixed(2),
    );

    // Update active assignments
    for (const a of activeAssignments) {
      a.luwangCount = newShare;
      a.updatedAt = new Date();
      await assignmentRepo.save(a);
    }

    // Create new assignments
    const assignmentsToSave = workersToAssign.map((workerId) =>
      assignmentRepo.create({
        worker: { id: workerId },
        pitak: { id: pitakId },
        session: { id: sessionId },
        luwangCount: newShare,
        assignmentDate: assignmentDateObj,
        status: "active",
        notes: notes || null,
      }),
    );
    const savedAssignments = await assignmentRepo.save(assignmentsToSave);

    // @ts-ignore
    if (shouldRelease) await queryRunner.commitTransaction();

    return {
      status: true,
      message: "Assignments created and redistributed successfully",
      data: {
        assignments: [
          ...completedAssignments,
          ...activeAssignments,
          ...savedAssignments,
        ],
      },
    };
  } catch (error) {
    // @ts-ignore
    if (shouldRelease) await queryRunner.rollbackTransaction();
    return {
      status: false,
      // @ts-ignore
      message: `Failed to create assignments: ${error.message}`,
      data: null,
    };
  } finally {
    // @ts-ignore
    if (shouldRelease) await queryRunner.release();
  }
};
