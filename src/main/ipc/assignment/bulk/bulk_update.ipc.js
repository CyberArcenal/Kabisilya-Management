// src/ipc/assignment/bulk/bulk_update.ipc.js
//@ts-check
const Assignment = require("../../../../entities/Assignment");
const Pitak = require("../../../../entities/Pitak");
const { validatePitak, formatNote } = require("../utils/assignmentUtils");

/**
 * Bulk update assignments
 * @param {Object} params - Bulk update parameters
 * @param {import("typeorm").QueryRunner} queryRunner - Transaction query runner
 * @returns {Promise<Object>} Response object
 */
module.exports = async (params, queryRunner) => {
  try {
    // @ts-ignore
    const { assignments, updateData, filters, _userId } = params;

    if (!assignments && !filters) {
      return { status: false, message: "Either assignments array or filters are required", data: null };
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      return { status: false, message: "Update data is required", data: null };
    }

    const assignmentRepo = queryRunner.manager.getRepository(Assignment);

    // @ts-ignore
    let assignmentsToUpdate = [];
    if (assignments && Array.isArray(assignments)) {
      // @ts-ignore
      assignmentsToUpdate = await assignmentRepo.findByIds(assignments, { relations: ["worker", "pitak"] });
    } else if (filters) {
      const queryBuilder = assignmentRepo.createQueryBuilder("assignment").leftJoinAndSelect("assignment.worker", "worker").leftJoinAndSelect("assignment.pitak", "pitak");

      if (filters.dateFrom && filters.dateTo) {
        queryBuilder.where("assignment.assignmentDate BETWEEN :dateFrom AND :dateTo", { dateFrom: filters.dateFrom, dateTo: filters.dateTo });
      }
      if (filters.status) {
        queryBuilder.andWhere("assignment.status = :status", { status: filters.status });
      }
      if (filters.workerId) {
        queryBuilder.andWhere("worker.id = :workerId", { workerId: filters.workerId });
      }
      if (filters.pitakId) {
        queryBuilder.andWhere("pitak.id = :pitakId", { pitakId: filters.pitakId });
      }

      assignmentsToUpdate = await queryBuilder.getMany();
    }

    if (assignmentsToUpdate.length === 0) {
      return { status: false, message: "No assignments found to update", data: null };
    }

    const validationErrors = [];
    const validUpdates = [];

    // @ts-ignore
    for (const assignment of assignmentsToUpdate) {
      const errors = [];

      // Business rule: only active assignments can be updated
      if (assignment.status !== "active") {
        errors.push(`Assignment ${assignment.id} is ${assignment.status} and cannot be updated`);
      }

      // Pitak status check
      const pitakCheck = await validatePitak(queryRunner.manager.getRepository(Pitak), assignment.pitak?.id);
      if (!pitakCheck.valid) {
        errors.push(pitakCheck.message);
      }

      // Validate status update
      if (updateData.status) {
        const validStatuses = ["active", "completed", "cancelled"];
        if (!validStatuses.includes(updateData.status)) {
          errors.push(`Invalid status: ${updateData.status}`);
        }
        if (updateData.status === "cancelled" && assignment.status === "completed") {
          errors.push("Cannot cancel a completed assignment");
        }
      }

      // Validate luwang count
      if (updateData.luwangCount !== undefined) {
        const count = parseFloat(updateData.luwangCount);
        if (isNaN(count) || count < 0) {
          errors.push(`Invalid luwang count: ${updateData.luwangCount}`);
        }
      }

      if (errors.length === 0) {
        validUpdates.push(assignment);
      } else {
        validationErrors.push({ assignmentId: assignment.id, errors });
      }
    }

    if (validUpdates.length === 0) {
      return { status: false, message: "All updates failed validation", data: { validationErrors } };
    }

    const updatedAssignments = [];
    const skippedAssignments = [];

    for (const assignment of validUpdates) {
      try {
        const originalValues = {
          status: assignment.status,
          luwangCount: parseFloat(assignment.luwangCount),
          notes: assignment.notes
        };

        const changes = [];

        if (updateData.status && updateData.status !== assignment.status) {
          changes.push(`Status: ${assignment.status} → ${updateData.status}`);
          assignment.status = updateData.status;
        }

        if (updateData.luwangCount !== undefined) {
          const newCount = parseFloat(updateData.luwangCount);
          const oldCount = parseFloat(assignment.luwangCount);
          if (newCount !== oldCount) {
            changes.push(`LuWang: ${oldCount.toFixed(2)} → ${newCount.toFixed(2)}`);
            assignment.luwangCount = newCount.toFixed(2);
          }
        }

        if (updateData.notes !== undefined && updateData.notes !== assignment.notes) {
          changes.push("Notes updated");
          assignment.notes = updateData.notes;
        }

        assignment.updatedAt = new Date();

        if (changes.length > 0) {
          const changeLog = formatNote(changes.join(", "), "bulk update");
          assignment.notes = assignment.notes ? `${assignment.notes}\n${changeLog}` : changeLog;
        }

        const updatedAssignment = await assignmentRepo.save(assignment);
        updatedAssignments.push({
          id: updatedAssignment.id,
          changes,
          originalValues,
          newValues: {
            status: updatedAssignment.status,
            luwangCount: parseFloat(updatedAssignment.luwangCount)
          }
        });

      } catch (error) {
        // @ts-ignore
        skippedAssignments.push({ assignmentId: assignment.id, error: error.message });
      }
    }

    const summary = {
      totalProcessed: assignmentsToUpdate.length,
      totalUpdated: updatedAssignments.length,
      totalSkipped: skippedAssignments.length,
      totalFailed: validationErrors.length,
      updatedStatuses: updatedAssignments.reduce((acc, item) => {
        const status = item.newValues.status;
        // @ts-ignore
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {})
    };

    return {
      status: true,
      message: "Bulk update completed",
      data: { updatedAssignments, skippedAssignments, failedUpdates: validationErrors },
      meta: summary
    };

  } catch (error) {
    console.error("Error in bulk assignment update:", error);
    // @ts-ignore
    return { status: false, message: `Bulk update failed: ${error.message}`, data: null };
  }
};