// src/ipc/pitak/update_luwang.ipc.js
//@ts-check

const Pitak = require("../../../entities/Pitak");
const UserActivity = require("../../../entities/UserActivity");

// @ts-ignore
module.exports = async (params, queryRunner) => {
  try {
    const { id, totalLuwang, adjustmentType = "set", notes, _userId, areaSqm, layoutType, sideLengths } = params;

    if (!id || totalLuwang === undefined) {
      return {
        status: false,
        message: "Pitak ID and totalLuwang are required",
        data: null,
      };
    }

    const totalLuwangNum = parseFloat(totalLuwang);
    if (isNaN(totalLuwangNum)) {
      return {
        status: false,
        message: "totalLuwang must be a valid number",
        data: null,
      };
    }

    const pitakRepo = queryRunner.manager.getRepository(Pitak);
    const pitak = await pitakRepo.findOne({ where: { id } });

    if (!pitak) {
      return { status: false, message: "Pitak not found", data: null };
    }

    const oldLuWang = parseFloat(pitak.totalLuwang);
    let newLuWang;

    switch (adjustmentType) {
      case "add":
        newLuWang = oldLuWang + totalLuwangNum;
        break;
      case "subtract":
        newLuWang = oldLuWang - totalLuwangNum;
        if (newLuWang < 0) {
          return {
            status: false,
            message: "Cannot subtract more than current total LuWang",
            data: null,
          };
        }
        break;
      case "set":
      default:
        newLuWang = totalLuwangNum;
        break;
    }

    if (newLuWang < 0) {
      return {
        status: false,
        message: "Total LuWang cannot be negative",
        data: null,
      };
    }

    // 🆕 Update pitak fields
    pitak.totalLuwang = newLuWang.toFixed(2);
    if (areaSqm !== undefined) {
      const areaNum = parseFloat(areaSqm);
      if (!isNaN(areaNum) && areaNum >= 0) {
        pitak.areaSqm = areaNum.toFixed(2);
      }
    }
    if (layoutType) {
      pitak.layoutType = layoutType;
    }
    if (sideLengths) {
      pitak.sideLengths = JSON.stringify(sideLengths);
    }

    if (notes) {
      pitak.notes =
        (pitak.notes ? pitak.notes + "\n" : "") +
        `[${new Date().toISOString()}] LuWang ${
          adjustmentType === "add"
            ? "increased"
            : adjustmentType === "subtract"
            ? "decreased"
            : "set"
        } from ${oldLuWang.toFixed(2)} to ${newLuWang.toFixed(2)}: ${notes}`;
    }
    pitak.updatedAt = new Date();

    const updatedPitak = await pitakRepo.save(pitak);

    // Log activity
    await queryRunner.manager.getRepository(UserActivity).save({
      user_id: _userId,
      action: "update_pitak_luwang",
      entity: "Pitak",
      entity_id: updatedPitak.id,
      details: JSON.stringify({
        oldLuWang,
        newLuWang,
        adjustmentType,
        difference: newLuWang - oldLuWang,
        notes,
        areaSqm: updatedPitak.areaSqm,
        layoutType: updatedPitak.layoutType,
        sideLengths: updatedPitak.sideLengths,
      }),
    });

    return {
      status: true,
      message: `Pitak LuWang ${
        adjustmentType === "add"
          ? "increased"
          : adjustmentType === "subtract"
          ? "decreased"
          : "updated"
      } from ${oldLuWang.toFixed(2)} to ${newLuWang.toFixed(2)}`,
      data: {
        id: updatedPitak.id,
        oldLuWang,
        newLuWang,
        difference: (newLuWang - oldLuWang).toFixed(2),
        areaSqm: updatedPitak.areaSqm,
        layoutType: updatedPitak.layoutType,
        sideLengths: updatedPitak.sideLengths,
        updatedAt: updatedPitak.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error updating pitak LuWang:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to update pitak LuWang: ${error.message}`,
      data: null,
    };
  }
};