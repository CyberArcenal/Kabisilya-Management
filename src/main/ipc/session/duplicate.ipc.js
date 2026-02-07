// src/ipc/session/duplicate.ipc.js
//@ts-check
const Session = require("../../../entities/Session");
const Bukid = require("../../../entities/Bukid");
const Pitak = require("../../../entities/Pitak");
const Assignment = require("../../../entities/Assignment");

/**
 * Duplicate a Session with optional Bukids, Pitaks, and Assignments
 * @param {Object} params - Duplicate parameters
 * @param {import("typeorm").QueryRunner} queryRunner - Transaction query runner
 * @returns {Promise<Object>} Response object
 */
module.exports = async (params, queryRunner) => {
  try {
    const {
      // @ts-ignore
      sessionId,
      // @ts-ignore
      newName,
      // @ts-ignore
      newYear,
      // @ts-ignore
      copyBukidPitak = false, // <-- new flag
      // @ts-ignore
      copyAssignments = false, // <-- existing flag
      // @ts-ignore
      _userId,
    } = params;

    if (!sessionId) {
      return { status: false, message: "Session ID is required", data: null };
    }
    if (!newName || newName.trim() === "") {
      return {
        status: false,
        message: "New session name is required",
        data: null,
      };
    }

    const sessionRepo = queryRunner.manager.getRepository(Session);
    const bukidRepo = queryRunner.manager.getRepository(Bukid);
    const pitakRepo = queryRunner.manager.getRepository(Pitak);
    const assignmentRepo = queryRunner.manager.getRepository(Assignment);

    // Load source session with relations depending on flags
    const relations = [];
    if (copyBukidPitak) relations.push("bukids", "bukids.pitaks");
    if (copyAssignments)
      relations.push("assignments", "assignments.worker", "assignments.pitak");

    const sourceSession = await sessionRepo.findOne({
      where: { id: sessionId },
      relations,
    });

    if (!sourceSession) {
      return { status: false, message: "Source session not found", data: null };
    }

    // Check if new session name already exists for the year
    const yearToUse = newYear || sourceSession.year;
    const existingSession = await sessionRepo.findOne({
      where: { name: newName.trim(), year: yearToUse },
    });
    if (existingSession) {
      return {
        status: false,
        message: "Session with this name and year already exists",
        data: null,
      };
    }

    // Create new session
    const newSessionData = {
      name: newName.trim(),
      seasonType: sourceSession.seasonType,
      year: yearToUse,
      startDate: sourceSession.startDate,
      endDate: sourceSession.endDate,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newSession = sessionRepo.create(newSessionData);
    const savedSession = await sessionRepo.save(newSession);

    // Optionally duplicate bukids and pitaks
    // @ts-ignore
    if (copyBukidPitak && sourceSession.bukids?.length > 0) {
      // @ts-ignore
      for (const sourceBukid of sourceSession.bukids) {
        // @ts-ignore
        const newBukid = bukidRepo.create({
          name: sourceBukid.name,
          status: "active",
          location: sourceBukid.location,
          session: savedSession,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const savedBukid = await bukidRepo.save(newBukid);

        if (sourceBukid.pitaks?.length > 0) {
          for (const sourcePitak of sourceBukid.pitaks) {
            // @ts-ignore
            const newPitak = pitakRepo.create({
              location: sourcePitak.location,
              totalLuwang: sourcePitak.totalLuwang,
              status: "active",
              bukid: savedBukid,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            await pitakRepo.save(newPitak);
          }
        }
      }
    }

    // Optionally copy assignments
    let copiedAssignments = [];
    // @ts-ignore
    if (copyAssignments && sourceSession.assignments?.length > 0) {
      // @ts-ignore
      for (const sourceAssignment of sourceSession.assignments) {
        const newAssignment = assignmentRepo.create({
          // @ts-ignore
          worker: sourceAssignment.worker,
          pitak: sourceAssignment.pitak,
          session: savedSession,
          status: "active",
          assignmentDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        copiedAssignments.push(await assignmentRepo.save(newAssignment));
      }
    }

    // Reload complete duplicated session with requested relations
    const completeSession = await sessionRepo.findOne({
      // @ts-ignore
      where: { id: savedSession.id },
      relations,
    });

    return {
      status: true,
      message: "Session duplicated successfully",
      data: {
        session: completeSession,
        copiedAssignments: copyAssignments ? copiedAssignments.length : 0,
        // @ts-ignore
        copiedBukids: copyBukidPitak ? completeSession.bukids?.length || 0 : 0,
      },
    };
  } catch (error) {
    console.error("Error duplicating session:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to duplicate session: ${error.message}`,
      data: null,
    };
  }
};
