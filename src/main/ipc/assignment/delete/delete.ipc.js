// src/ipc/assignment/delete/delete.ipc.js
//@ts-check
const Assignment = require("../../../../entities/Assignment");
const Pitak = require("../../../../entities/Pitak");

// @ts-ignore
module.exports = async (params, queryRunner) => {
  try {
    // @ts-ignore
    const { assignmentId, reason, _userId } = params;
    if (!assignmentId)
      return { status: false, message: "Assignment ID required", data: null };

    const assignmentRepo = queryRunner.manager.getRepository(Assignment);
    const pitakRepo = queryRunner.manager.getRepository(Pitak);

    const assignment = await assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ["worker", "pitak"],
    });
    if (!assignment)
      return { status: false, message: "Assignment not found", data: null };
    if (assignment.status === "completed")
      return {
        status: false,
        message: "Cannot delete completed assignment",
        data: null,
      };

    const now = new Date();
    assignment.status = "cancelled";
    assignment.updatedAt = now;
    assignment.notes =
      (assignment.notes || "") +
      `\n[Deleted ${now.toISOString()}]: ${reason || "No reason"}`;
    const updatedAssignment = await assignmentRepo.save(assignment);

    // ✅ Redistribute only among active assignments, excluding completed
    const allAssignments = await assignmentRepo.find({
      where: {
        pitak: { id: assignment.pitak.id },
        assignmentDate: assignment.assignmentDate,
      },
      relations: ["worker", "pitak"],
    });

    const completedAssignments = allAssignments.filter(
      // @ts-ignore
      (a) => a.status === "completed",
    );
    const activeAssignments = allAssignments.filter(
      // @ts-ignore
      (a) => a.status === "active",
    );

    const lockedLuWang = completedAssignments.reduce(
      // @ts-ignore
      (sum, a) => sum + parseFloat(a.luwangCount || 0),
      0,
    );
    const pitak = await pitakRepo.findOne({
      where: { id: assignment.pitak.id },
    });
    const pitakTotal = parseFloat(pitak.totalLuwang) || 0;
    const remainingLuWang = pitakTotal - lockedLuWang;

    if (remainingLuWang > 0 && activeAssignments.length > 0) {
      const newShare = parseFloat(
        (remainingLuWang / activeAssignments.length).toFixed(2),
      );
      for (const a of activeAssignments) {
        a.luwangCount = newShare;
        a.updatedAt = now;
        await assignmentRepo.save(a);
      }
    }

    return {
      status: true,
      message: "Assignment cancelled and LuWang redistributed",
      data: {
        cancelled: updatedAssignment.id,
        // @ts-ignore
        redistribution: activeAssignments.map((a) => ({
          id: a.id,
          workerId: a.worker?.id ?? null,
          newLuWang: a.luwangCount,
        })),
        // @ts-ignore
        lockedAssignments: completedAssignments.map((a) => ({
          id: a.id,
          workerId: a.worker?.id ?? null,
          luWang: a.luwangCount,
        })),
      },
    };
  } catch (error) {
    return {
      status: false,
      // @ts-ignore
      message: `Failed to delete assignment: ${error.message}`,
      data: null,
    };
  }
};
