// src/ipc/pitak/update_status.ipc.js
//@ts-check

const Pitak = require("../../../entities/Pitak");
const Assignment = require("../../../entities/Assignment");
const UserActivity = require("../../../entities/UserActivity");

module.exports = async (
  /** @type {{ id: any; status: any; notes: any; _userId: any; }} */ params,
  /** @type {import("typeorm").QueryRunner} */ queryRunner
) => {
  try {
    const { id, status, notes, _userId } = params;

    if (!id || !status) {
      throw new Error("Pitak ID and status are required");
    }

    const validStatuses = ["active", "inactive", "completed"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const pitakRepo = queryRunner.manager.getRepository(Pitak);
    const pitak = await pitakRepo.findOne({ where: { id } });

    if (!pitak) {
      throw new Error("Pitak not found");
    }

    const oldStatus = pitak.status;

    // If marking as completed, also mark all active assignments as completed
    let updatedAssignmentsCount = 0;
    if (status === "completed") {
      const assignmentRepo = queryRunner.manager.getRepository(Assignment);
      const activeAssignments = await assignmentRepo.find({
        // @ts-ignore
        where: { pitak: { id }, status: "active" },
      });

      if (activeAssignments.length > 0) {
        for (const assignment of activeAssignments) {
          assignment.status = "completed";
          assignment.updatedAt = new Date();
        }
        await assignmentRepo.save(activeAssignments);
        updatedAssignmentsCount = activeAssignments.length;
      }
    }

    // Update pitak status
    pitak.status = status;
    if (notes) {
      // @ts-ignore
      pitak.notes =
        // @ts-ignore
        (pitak.notes ? pitak.notes + "\n" : "") +
        `[${new Date().toISOString()}] Status changed to ${status}: ${notes}`;
    }
    pitak.updatedAt = new Date();

    const updatedPitak = await pitakRepo.save(pitak);

    // Log activity
    await queryRunner.manager.getRepository(UserActivity).save({
      user_id: _userId,
      action: "update_pitak_status",
      entity: "Pitak",
      entity_id: updatedPitak.id,
      details: JSON.stringify({
        oldStatus,
        newStatus: status,
        notes,
        updatedAssignmentsCount,
      }),
    });

    return {
      status: true,
      message: `Pitak status updated from ${oldStatus} to ${status}. ${
        updatedAssignmentsCount > 0
          ? `${updatedAssignmentsCount} assignments also marked as completed.`
          : ""
      }`,
      data: {
        id: updatedPitak.id,
        oldStatus,
        newStatus: updatedPitak.status,
        updatedAt: updatedPitak.updatedAt,
        updatedAssignmentsCount,
      },
    };
  } catch (error) {
    // ❌ Throw error so handleWithTransaction will rollback
    console.error("Error updating pitak status:", error);
    throw error;
  }
};