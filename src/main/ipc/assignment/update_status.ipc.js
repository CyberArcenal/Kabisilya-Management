// src/ipc/assignment/update_status.ipc.js
//@ts-check

const Assignment = require("../../../entities/Assignment");
const Pitak = require("../../../entities/Pitak");
const { validatePitak } = require("./utils/assignmentUtils");

/**
 * Update assignment status
 * @param {Object} params - Update parameters
 * @param {import("typeorm").QueryRunner} queryRunner - Transaction query runner
 * @returns {Promise<Object>} Response object
 */
module.exports = async (params, queryRunner) => {
  try {
    const { 
      // @ts-ignore
      assignmentId, 
      // @ts-ignore
      status, 
      // @ts-ignore
      notes,
      // @ts-ignore
      // @ts-ignore
      _userId 
    } = params;

    if (!assignmentId || !status) {
      return {
        status: false,
        message: "Missing required fields: assignmentId and status are required",
        data: null
      };
    }

    const validStatuses = ["active", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return {
        status: false,
        message: "Invalid status. Must be one of: active, completed, cancelled",
        data: null
      };
    }

    const assignmentRepo = queryRunner.manager.getRepository(Assignment);

    const assignment = await assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ["worker", "pitak"]
    });

    if (!assignment) {
      return { status: false, message: "Assignment not found", data: null };
    }

    // 🔑 NEW: Check pitak status
    // @ts-ignore
    const pitakCheck = await validatePitak(queryRunner.manager.getRepository(Pitak), assignment.pitak?.id);
    if (!pitakCheck.valid) {
      return { status: false, message: pitakCheck.message, data: null };
    }

    if (assignment.status === status) {
      return {
        status: false,
        message: `Assignment is already ${status}`,
        data: assignment
      };
    }

    if (status === "cancelled" && assignment.status === "completed") {
      return {
        status: false,
        message: "Cannot cancel a completed assignment",
        data: null
      };
    }

    const previousStatus = assignment.status;

    assignment.status = status;
    assignment.updatedAt = new Date();

    if (notes) {
      // @ts-ignore
      const statusNote = `[Status Change ${previousStatus.toUpperCase()} → ${status.toUpperCase()}]: ${notes}`;
      assignment.notes = assignment.notes
        ? `${assignment.notes}\n${statusNote}`
        : statusNote;
    }

    const updatedAssignment = await assignmentRepo.save(assignment);

    return {
      status: true,
      message: `Assignment status updated to ${status}`,
      data: {
        id: updatedAssignment.id,
        previousStatus,
        newStatus: updatedAssignment.status,
        assignmentDate: updatedAssignment.assignmentDate,
        // @ts-ignore
        worker: updatedAssignment.worker
          // @ts-ignore
          ? { id: updatedAssignment.worker.id, name: updatedAssignment.worker.name }
          : null,
        // @ts-ignore
        pitak: updatedAssignment.pitak
          // @ts-ignore
          ? { id: updatedAssignment.pitak.id, name: updatedAssignment.pitak.name }
          : null,
        summary: {
          assignmentId: updatedAssignment.id,
          // @ts-ignore
          pitakId: updatedAssignment.pitak?.id ?? null,
          // @ts-ignore
          workerId: updatedAssignment.worker?.id ?? null,
          status: updatedAssignment.status
        }
      }
    };

  } catch (error) {
    console.error("Error updating assignment status:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to update assignment status: ${error.message}`,
      data: null
    };
  }
};