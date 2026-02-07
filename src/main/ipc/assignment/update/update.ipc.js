// src/ipc/assignment/update/update.ipc.js
//@ts-check
const Assignment = require("../../../../entities/Assignment");
const Worker = require("../../../../entities/Worker");
const Pitak = require("../../../../entities/Pitak");
const {
  validateWorkers,
  findAlreadyAssigned,
  validatePitak,
  formatNote,
} = require("../utils/assignmentUtils");

/**
 * Update assignment details
 * @param {Object} params - Update parameters
 * @param {import("typeorm").QueryRunner} queryRunner - Transaction query runner
 * @returns {Promise<Object>} Response object
 */
module.exports = async (params, queryRunner) => {
  try {
    // @ts-ignore
    const {
      assignmentId,
      workerId,
      pitakId,
      luwangCount,
      assignmentDate,
      notes,
      userId,
    } = params;

    if (!assignmentId) {
      return {
        status: false,
        message: "Assignment ID is required",
        data: null,
      };
    }

    const assignmentRepo = queryRunner.manager.getRepository(Assignment);
    const workerRepo = queryRunner.manager.getRepository(Worker);
    const pitakRepo = queryRunner.manager.getRepository(Pitak);

    // Find assignment
    const assignment = await assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ["worker", "pitak"],
    });

    if (!assignment) {
      return { status: false, message: "Assignment not found", data: null };
    }

    // Business rule: only active assignments can be updated
    if (assignment.status !== "active") {
      return {
        status: false,
        message: `Cannot update a ${assignment.status} assignment`,
        data: null,
      };
    }

    const changes = [];
    const originalValues = {
      // @ts-ignore
      workerId: assignment.worker?.id,
      // @ts-ignore
      pitakId: assignment.pitak?.id,
      // @ts-ignore
      luwangCount: parseFloat(assignment.luwangCount),
      assignmentDate: assignment.assignmentDate,
      notes: assignment.notes,
    };

    // Validate and update worker if changed
    // @ts-ignore
    if (workerId && workerId !== assignment.worker?.id) {
      const workerCheck = await validateWorkers(workerRepo, [workerId]);
      if (!workerCheck.valid) {
        return { status: false, message: workerCheck.message, data: null };
      }
      const newWorker = workerCheck.workers[0];

      // Check if new worker already assigned to same pitak/date
      // @ts-ignore
      const skipped = await findAlreadyAssigned(
        assignmentRepo,
        [workerId],
        assignment.pitak?.id,
      );
      if (skipped.length > 0) {
        return {
          status: false,
          message: "New worker already has an active assignment for this pitak",
          data: null,
        };
      }

      // @ts-ignore
      changes.push(
        `Worker changed from ${assignment.worker?.name || "Unknown"} to ${newWorker.name}`,
      );
      // @ts-ignore
      assignment.worker = { id: workerId };
    }

    // Validate and update pitak if changed
    // @ts-ignore
    if (pitakId && pitakId !== assignment.pitak?.id) {
      const pitakCheck = await validatePitak(pitakRepo, pitakId);
      if (!pitakCheck.valid) {
        return { status: false, message: pitakCheck.message, data: null };
      }
      const newPitak = pitakCheck.pitak;

      // @ts-ignore
      changes.push(
        `Pitak changed from ${assignment.pitak?.name || "Unknown"} to ${newPitak.name}`,
      );
      // @ts-ignore
      assignment.pitak = { id: pitakId };
    }

    // Update luwang count if changed
    if (luwangCount !== undefined) {
      const newCount = parseFloat(luwangCount);
      if (isNaN(newCount) || newCount < 0) {
        return {
          status: false,
          message: "LuWang count must be a non-negative number",
          data: null,
        };
      }
      // @ts-ignore
      const oldCount = parseFloat(assignment.luwangCount);
      if (newCount !== oldCount) {
        changes.push(
          `LuWang count changed from ${oldCount.toFixed(2)} to ${newCount.toFixed(2)}`,
        );
        assignment.luwangCount = newCount.toFixed(2);
      }
    }

    // Update assignment date if changed
    if (assignmentDate) {
      const newDate = new Date(assignmentDate);
      // @ts-ignore
      const oldDate = new Date(assignment.assignmentDate);

      if (newDate.toDateString() !== oldDate.toDateString()) {
        // Check if worker already has assignment on new date
        // @ts-ignore
        const workerIdToCheck = workerId || assignment.worker?.id;
        const existingAssignment = await assignmentRepo.findOne({
          // @ts-ignore
          where: {
            worker: { id: workerIdToCheck },
            assignmentDate: newDate,
            status: "active",
          },
        });
        if (existingAssignment) {
          return {
            status: false,
            message: "Worker already has an active assignment for the new date",
            data: null,
          };
        }

        changes.push(
          `Date changed from ${oldDate.toDateString()} to ${newDate.toDateString()}`,
        );
        assignment.assignmentDate = newDate;
      }
    }

    // Update notes if provided
    if (notes !== undefined && notes !== assignment.notes) {
      changes.push("Notes updated");
      assignment.notes = notes;
    }

    if (changes.length === 0) {
      return {
        status: false,
        message: "No changes detected",
        data: { assignment },
      };
    }

    assignment.updatedAt = new Date();

    // Append change log to notes
    const changeLog = formatNote(changes.join(", "), "update");
    assignment.notes = assignment.notes
      ? `${assignment.notes}\n${changeLog}`
      : changeLog;

    const updatedAssignment = await assignmentRepo.save(assignment);

    return {
      status: true,
      message: "Assignment updated successfully",
      data: {
        id: updatedAssignment.id,
        changes,
        originalValues,
        newValues: {
          // @ts-ignore
          workerId: updatedAssignment.worker?.id,
          // @ts-ignore
          pitakId: updatedAssignment.pitak?.id,
          // @ts-ignore
          luwangCount: parseFloat(updatedAssignment.luwangCount),
          assignmentDate: updatedAssignment.assignmentDate,
        },
        summary: {
          assignmentId: updatedAssignment.id,
          // @ts-ignore
          pitakId: updatedAssignment.pitak?.id ?? null,
          // @ts-ignore
          workerId: updatedAssignment.worker?.id ?? null,
          status: updatedAssignment.status,
        },
        assignment: await assignmentRepo.findOne({
          where: { id: assignmentId },
          relations: ["worker", "pitak"],
        }),
      },
    };
  } catch (error) {
    console.error("Error updating assignment:", error);
    // @ts-ignore
    return {
      status: false,
      message: `Failed to update assignment: ${error.message}`,
      data: null,
    };
  }
};
