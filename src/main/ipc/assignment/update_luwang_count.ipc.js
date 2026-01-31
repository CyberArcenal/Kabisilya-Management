// src/ipc/assignment/update_luwang_count.ipc.js
//@ts-check

const Assignment = require("../../../entities/Assignment");
const { validatePitak } = require("./utils/assignmentUtils");

/**
 * Update luwang count for an assignment
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
      luwangCount, 
      // @ts-ignore
      notes,
      // @ts-ignore
      // @ts-ignore
      _userId 
    } = params;

    if (!assignmentId || luwangCount === undefined) {
      return {
        status: false,
        message: "Missing required fields: assignmentId and luwangCount are required",
        data: null
      };
    }

    const count = parseFloat(luwangCount);
    if (isNaN(count) || count < 0) {
      return {
        status: false,
        message: "LuWang count must be a non-negative number",
        data: null
      };
    }

    const assignmentRepo = queryRunner.manager.getRepository(Assignment);

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
    const pitakCheck = await validatePitak(queryRunner.manager.getRepository(require("../../../entities/Pitak")), assignment.pitak?.id);
    if (!pitakCheck.valid) {
      return { status: false, message: pitakCheck.message, data: null };
    }

    // Only allow updates for active assignments
    if (assignment.status !== "active") {
      return {
        status: false,
        message: `Cannot update LuWang count for ${assignment.status} assignment`,
        data: null
      };
    }

    // @ts-ignore
    const previousCount = parseFloat(assignment.luwangCount);

    // Update assignment
    assignment.luwangCount = count.toFixed(2);
    assignment.updatedAt = new Date();

    // Append note if provided
    if (notes) {
      const updateNote = `[LuWang Update ${previousCount.toFixed(2)} → ${count.toFixed(2)}]: ${notes}`;
      assignment.notes = assignment.notes
        ? `${assignment.notes}\n${updateNote}`
        : updateNote;
    }

    const updatedAssignment = await assignmentRepo.save(assignment);

    return {
      status: true,
      message: "LuWang count updated successfully",
      data: {
        id: updatedAssignment.id,
        previousLuWang: previousCount.toFixed(2),
        // @ts-ignore
        newLuWang: parseFloat(updatedAssignment.luwangCount).toFixed(2),
        difference: (count - previousCount).toFixed(2),
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
    console.error("Error updating luwang count:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to update LuWang count: ${error.message}`,
      data: null
    };
  }
};