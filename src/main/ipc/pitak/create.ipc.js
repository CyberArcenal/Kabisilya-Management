// src/ipc/pitak/create.ipc.js
//@ts-check

const Pitak = require("../../../entities/Pitak");
const Bukid = require("../../../entities/Bukid");
const UserActivity = require("../../../entities/UserActivity");
const { farmSessionDefaultSessionId } = require("../../../utils/system");

// @ts-ignore
module.exports = async (params, queryRunner) => {
  try {
    const {
      bukidId,
      location,
      notes = null,
      totalLuwang = 0.0,
      status = "active",
      layoutType = "square", // 🆕 new field
      sideLengths = null, // 🆕 new field (JSON)
      areaSqm = 0.0, // 🆕 new field

      _userId,
    } = params;

    if (!bukidId) {
      return { status: false, message: "Bukid ID is required", data: null };
    }

    // ✅ Always require default session
    const sessionId = await farmSessionDefaultSessionId();
    if (!sessionId || sessionId === 0) {
      return {
        status: false,
        message: "No default session configured. Please set one in Settings.",
        data: null,
      };
    }

    const bukidRepo = queryRunner.manager.getRepository(Bukid);
    const bukid = await bukidRepo.findOne({ where: { id: bukidId } });

    if (!bukid) {
      return { status: false, message: "Bukid not found", data: null };
    }

    const pitakRepo = queryRunner.manager.getRepository(Pitak);

    // ✅ Check for duplicate location in same bukid
    if (location) {
      const existing = await pitakRepo.findOne({
        where: { bukid: { id: bukidId }, location },
      });
      if (existing) {
        return {
          status: false,
          message: "A pitak already exists at this location in the same bukid",
          data: null,
        };
      }
    }

    // ✅ Create pitak tied to bukid + session
    const newPitak = pitakRepo.create({
      bukid: { id: bukidId },
      location,
      totalLuwang: parseFloat(totalLuwang),
      status,
      layoutType, // 🆕 save layout type
      sideLengths: sideLengths ? JSON.stringify(sideLengths) : null, // 🆕 save side lengths
      areaSqm: parseFloat(areaSqm), // 🆕 save computed area
      session: { id: sessionId },
      notes: notes,
    });

    const savedPitak = await pitakRepo.save(newPitak);

    // ✅ Log activity with session context
    await queryRunner.manager.getRepository(UserActivity).save({
      user_id: _userId,
      action: "create_pitak",
      entity: "Pitak",
      entity_id: savedPitak.id,
      session: { id: sessionId },
      details: JSON.stringify({
        bukidId,
        location,
        totalLuwang,
        status,
        layoutType,
        sideLengths,
        areaSqm,
      }),
      created_at: new Date(),
    });

    return {
      status: true,
      message: "Pitak created successfully",
      data: {
        id: savedPitak.id,
        bukidId: savedPitak.bukid?.id,
        location: savedPitak.location,
        totalLuwang: parseFloat(savedPitak.totalLuwang),
        areaSqm: parseFloat(savedPitak.areaSqm), // 🆕 return area
        layoutType: savedPitak.layoutType, // 🆕 return layout
        sideLengths: savedPitak.sideLengths, // 🆕 return side lengths
        status: savedPitak.status,
        sessionId,
        createdAt: savedPitak.createdAt,
      },
    };
  } catch (error) {
    console.error("Error creating pitak:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to create pitak: ${error.message}`,
      data: null,
    };
  }
};
