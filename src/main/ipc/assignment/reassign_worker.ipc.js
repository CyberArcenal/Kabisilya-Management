//@ts-check

const Assignment = require("../../../entities/Assignment");
const Pitak = require("../../../entities/Pitak");
const Worker = require("../../../entities/Worker");
const { validatePitak, validateWorkers, findAlreadyAssigned } = require("./utils/assignmentUtils");


/**
 * Reassign worker to another assignment
 * @param {Object} params - Reassignment parameters
 * @param {import("typeorm").QueryRunner} queryRunner - Transaction query runner
 * @returns {Promise<Object>} Response object
 */
module.exports = async (params, queryRunner) => {
  try {
    const { 
      // @ts-ignore
      assignmentId, 
      // @ts-ignore
      newWorkerId, 
      // @ts-ignore
      reason,
      // @ts-ignore
      // @ts-ignore
      _userId 
    } = params;

    if (!assignmentId || !newWorkerId) {
      return {
        status: false,
        message: "Assignment ID and new worker ID are required",
        data: null
      };
    }

    const assignmentRepo = queryRunner.manager.getRepository(Assignment);
    const workerRepo = queryRunner.manager.getRepository(Worker);
    const pitakRepo = queryRunner.manager.getRepository(Pitak);

    // Find assignment
    const assignment = await assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ["worker", "pitak"]
    });

    if (!assignment) {
      return { status: false, message: "Assignment not found", data: null };
    }

    // 🔑 NEW: Check pitak status
    // @ts-ignore
    const pitakCheck = await validatePitak(pitakRepo, assignment.pitak?.id);
    if (!pitakCheck.valid) {
      return { status: false, message: pitakCheck.message, data: null };
    }

    // Check if assignment can be reassigned
    if (assignment.status !== "active") {
      return {
        status: false,
        message: `Cannot reassign ${assignment.status} assignment`,
        data: null
      };
    }

    // Validate new worker
    const workerCheck = await validateWorkers(workerRepo, [newWorkerId]);
    if (!workerCheck.valid) {
      return { status: false, message: workerCheck.message, data: null };
    }
    const newWorker = workerCheck.workers[0];

    // Check if new worker already assigned to same pitak
    // @ts-ignore
    const skippedWorkers = await findAlreadyAssigned(assignmentRepo, [newWorkerId], assignment.pitak?.id);
    if (skippedWorkers.length > 0) {
      return {
        status: false,
        message: "New worker is already assigned to this pitak",
        data: null
      };
    }

    // @ts-ignore
    const oldWorker = assignment.worker;

    // Update assignment
    // @ts-ignore
    assignment.worker = { id: newWorkerId };
    assignment.updatedAt = new Date();

    // Add reassignment note
    const reassignmentNote = `[Reassignment]: Worker changed from ${oldWorker?.name || "Unknown"} (ID: ${oldWorker?.id}) to ${newWorker.name} (ID: ${newWorkerId})${reason ? ` - Reason: ${reason}` : ""}`;
    assignment.notes = assignment.notes
      ? `${assignment.notes}\n${reassignmentNote}`
      : reassignmentNote;

    const updatedAssignment = await assignmentRepo.save(assignment);

    return {
      status: true,
      message: "Worker reassigned successfully",
      data: {
        id: updatedAssignment.id,
        oldWorker: oldWorker ? { id: oldWorker.id, name: oldWorker.name } : null,
        newWorker: { id: newWorker.id, name: newWorker.name, code: newWorker.code },
        assignmentDate: updatedAssignment.assignmentDate,
        // @ts-ignore
        pitak: updatedAssignment.pitak
          // @ts-ignore
          ? { id: updatedAssignment.pitak.id, name: updatedAssignment.pitak.name }
          : null,
        reassignmentNote,
        summary: {
          assignmentId: updatedAssignment.id,
          // @ts-ignore
          pitakId: updatedAssignment.pitak?.id ?? null,
          oldWorkerId: oldWorker?.id ?? null,
          newWorkerId: newWorker.id,
          status: updatedAssignment.status
        }
      }
    };

  } catch (error) {
    console.error("Error reassigning worker:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to reassign worker: ${error.message}`,
      data: null
    };
  }
};