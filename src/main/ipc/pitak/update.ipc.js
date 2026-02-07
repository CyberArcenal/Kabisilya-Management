// src/ipc/pitak/update.ipc.js
//@ts-check

const Pitak = require("../../../entities/Pitak");
const UserActivity = require("../../../entities/UserActivity");

// @ts-ignore
module.exports = async (params, queryRunner) => {
  try {
    const {
      id,
      location,
      totalLuwang,
      status,
      layoutType,
      sideLengths,
      areaSqm,
      userId,
    } = params;

    if (!id) {
      return { status: false, message: "Pitak ID is required", data: null };
    }

    const pitakRepo = queryRunner.manager.getRepository(Pitak);
    const pitak = await pitakRepo.findOne({ where: { id } });

    if (!pitak) {
      return { status: false, message: "Pitak not found", data: null };
    }

    // Store old values for activity log
    const oldValues = {
      location: pitak.location,
      totalLuwang: pitak.totalLuwang,
      status: pitak.status,
      layoutType: pitak.layoutType,
      sideLengths: pitak.sideLengths,
      areaSqm: pitak.areaSqm,
    };

    // Update fields
    if (location !== undefined) pitak.location = location;
    if (totalLuwang !== undefined) pitak.totalLuwang = parseFloat(totalLuwang);
    if (status !== undefined) pitak.status = status;
    if (layoutType !== undefined) pitak.layoutType = layoutType;
    if (sideLengths !== undefined)
      pitak.sideLengths = JSON.stringify(sideLengths);
    if (areaSqm !== undefined) pitak.areaSqm = parseFloat(areaSqm);

    pitak.updatedAt = new Date();

    const updatedPitak = await pitakRepo.save(pitak);

    // Log activity
    await queryRunner.manager.getRepository(UserActivity).save({
      user_id: userId,
      action: "update_pitak",
      entity: "Pitak",
      entity_id: updatedPitak.id,
      details: JSON.stringify({
        changes: {
          location:
            location !== undefined
              ? { old: oldValues.location, new: location }
              : undefined,
          totalLuwang:
            totalLuwang !== undefined
              ? { old: oldValues.totalLuwang, new: totalLuwang }
              : undefined,
          status:
            status !== undefined
              ? { old: oldValues.status, new: status }
              : undefined,
          layoutType:
            layoutType !== undefined
              ? { old: oldValues.layoutType, new: layoutType }
              : undefined,
          sideLengths:
            sideLengths !== undefined
              ? { old: oldValues.sideLengths, new: sideLengths }
              : undefined,
          areaSqm:
            areaSqm !== undefined
              ? { old: oldValues.areaSqm, new: areaSqm }
              : undefined,
        },
      }),
    });

    return {
      status: true,
      message: "Pitak updated successfully",
      data: {
        id: updatedPitak.id,
        bukidId: updatedPitak.bukidId,
        location: updatedPitak.location,
        totalLuwang: parseFloat(updatedPitak.totalLuwang),
        areaSqm: parseFloat(updatedPitak.areaSqm),
        layoutType: updatedPitak.layoutType,
        sideLengths: updatedPitak.sideLengths,
        status: updatedPitak.status,
        updatedAt: updatedPitak.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error updating pitak:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to update pitak: ${error.message}`,
      data: null,
    };
  }
};
