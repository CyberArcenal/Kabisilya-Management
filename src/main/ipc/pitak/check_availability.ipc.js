// src/ipc/pitak/check_availability.ipc.js
//@ts-check

const Pitak = require("../../../entities/Pitak");
const Assignment = require("../../../entities/Assignment");
const { AppDataSource } = require("../../db/dataSource");
const { In } = require("typeorm");

// @ts-ignore
module.exports = async (params) => {
  try {
    // @ts-ignore
    const { pitakId, date, workerId, userId } = params;

    if (!pitakId) {
      return { status: false, message: "Pitak ID is required", data: null };
    }

    const pitakRepo = AppDataSource.getRepository(Pitak);
    const assignmentRepo = AppDataSource.getRepository(Assignment);

    // Get pitak
    const pitak = await pitakRepo.findOne({
      where: { id: pitakId },
      relations: ["bukid"],
    });

    if (!pitak) {
      return { status: false, message: "Pitak not found", data: null };
    }

    // Base availability object
    const availability = {
      pitakId,
      location: pitak.location,
      status: pitak.status,
      // @ts-ignore
      totalLuwang: parseFloat(pitak.totalLuwang),
      isAvailable: pitak.status === "active",
      reasons: [],
    };

    if (pitak.status !== "active") {
      // @ts-ignore
      availability.reasons.push(`Pitak status is "${pitak.status}"`);
    }

    // Check assignments for specific date
    if (date) {
      const checkDate = new Date(date);

      const existingAssignments = await assignmentRepo.find({
        where: {
          // @ts-ignore
          pitak: { id: pitakId }, // ✅ relation object
          assignmentDate: checkDate,
          status: In(["active", "completed"]),
        },
        relations: ["worker"],
      });

      if (existingAssignments.length > 0) {
        const assignedWorkers = existingAssignments.map((a) => ({
          // @ts-ignore
          workerId: a.worker?.id || a.workerId,
          // @ts-ignore
          workerName: a.worker ? a.worker.name : "Unknown",
          // @ts-ignore
          luwangCount: parseFloat(a.luwangCount),
        }));

        // @ts-ignore
        availability.existingAssignments = existingAssignments.length;
        // @ts-ignore
        availability.assignedWorkers = assignedWorkers;
        // @ts-ignore
        availability.totalAssignedLuWang = assignedWorkers.reduce(
          (sum, w) => sum + w.luwangCount,
          0,
        );
        // @ts-ignore
        availability.remainingLuWang =
          // @ts-ignore
          parseFloat(pitak.totalLuwang) - availability.totalAssignedLuWang;

        // Check if worker is already assigned
        if (workerId) {
          const isWorkerAssigned = existingAssignments.some(
            // @ts-ignore
            (a) => a.worker?.id === workerId || a.workerId === workerId,
          );
          if (isWorkerAssigned) {
            availability.isAvailable = false;
            availability.reasons.push(
              // @ts-ignore
              `Worker is already assigned to this pitak on ${
                checkDate.toISOString().split("T")[0]
              }`,
            );
          }
        }

        // Check if pitak is fully utilized
        // @ts-ignore
        if (availability.remainingLuWang <= 0) {
          availability.isAvailable = false;
          availability.reasons.push(
            // @ts-ignore
            "Pitak is fully utilized (no remaining LuWang capacity)",
          );
        }
      } else {
        // @ts-ignore
        availability.existingAssignments = 0;
        // @ts-ignore
        availability.remainingLuWang = parseFloat(pitak.totalLuwang);
      }
    }

    // Check if pitak has any active assignments overall
    const activeAssignmentsCount = await assignmentRepo.count({
      where: {
        // @ts-ignore
        pitak: { id: pitakId }, // ✅ relation object
        status: "active",
      },
    });
    // @ts-ignore
    availability.activeAssignments = activeAssignmentsCount;

    // Utilization rate
    if (availability.totalLuwang > 0) {
      // @ts-ignore
      availability.utilizationRate = availability.totalAssignedLuWang
        ? // @ts-ignore
          (availability.totalAssignedLuWang / availability.totalLuwang) * 100
        : 0;
    }

    // Recommendation
    if (availability.isAvailable) {
      // @ts-ignore
      if (availability.remainingLuWang > 0) {
        // @ts-ignore
        availability.recommendation = {
          canAssign: true,
          // @ts-ignore
          maxLuWang: availability.remainingLuWang.toFixed(2),
          // @ts-ignore
          message: `Pitak is available with ${availability.remainingLuWang.toFixed(
            2,
          )} LuWang capacity remaining`,
        };
      }
    } else {
      // @ts-ignore
      availability.recommendation = {
        canAssign: false,
        reasons: availability.reasons,
        suggestedAction: availability.reasons.includes(
          // @ts-ignore
          'Pitak status is "inactive"',
        )
          ? "Activate the pitak first"
          : // @ts-ignore
            availability.reasons.includes("Pitak is fully utilized")
            ? "Consider assigning to a different pitak or increasing capacity"
            : "Resolve the issues mentioned above",
      };
    }

    return {
      status: true,
      message: "Availability check completed",
      data: availability,
    };
  } catch (error) {
    console.error("Error checking pitak availability:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to check availability: ${error.message}`,
      data: null,
    };
  }
};
