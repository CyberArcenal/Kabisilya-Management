// // src/ipc/assignment/add_note.ipc.js
// //@ts-check

// const Assignment = require("../../../entities/Assignment");

// /**
//  * Add note to assignment
//  * @param {Object} params - Add note parameters
//  * @param {import("typeorm").QueryRunner} queryRunner - Transaction query runner
//  * @returns {Promise<Object>} Response object
//  */
// module.exports = async (params, queryRunner) => {
//   try {
//     const {
//       // @ts-ignore
//       assignmentId,
//       // @ts-ignore
//       note,
//       // @ts-ignore
//       noteType,
//       // @ts-ignore
//       userId
//     } = params;

//     if (!assignmentId || !note) {
//       return {
//         status: false,
//         message: "Assignment ID and note are required",
//         data: null
//       };
//     }

//     const assignmentRepo = queryRunner.manager.getRepository(Assignment);

//     // Find assignment
//     const assignment = await assignmentRepo.findOne({
//       where: { id: assignmentId },
//       relations: ["worker", "pitak"]
//     });

//     if (!assignment) {
//       return {
//         status: false,
//         message: "Assignment not found",
//         data: null
//       };
//     }

//     // Format note based on type
//     let formattedNote = note;

//     if (noteType) {
//       const timestamp = new Date().toISOString();
//       switch (noteType.toLowerCase()) {
//         case 'comment':
//           formattedNote = `[Comment ${timestamp}]: ${note}`;
//           break;
//         case 'reminder':
//           formattedNote = `[Reminder ${timestamp}]: ${note}`;
//           break;
//         case 'issue':
//           formattedNote = `[Issue ${timestamp}]: ${note}`;
//           break;
//         case 'resolution':
//           formattedNote = `[Resolution ${timestamp}]: ${note}`;
//           break;
//         default:
//           formattedNote = `[Note ${timestamp}]: ${note}`;
//       }
//     } else {
//       const timestamp = new Date().toISOString();
//       formattedNote = `[Note ${timestamp}]: ${note}`;
//     }

//     // Update assignment
//     assignment.notes = assignment.notes
//       ? `${assignment.notes}\n${formattedNote}`
//       : formattedNote;

//     assignment.updatedAt = new Date();

//     const updatedAssignment = await assignmentRepo.save(assignment);

//     // Log activity (called from main handler)

//     return {
//       status: true,
//       message: "Note added successfully",
//       data: {
//         id: updatedAssignment.id,
//         note: formattedNote,
//         assignment: {
//           assignmentDate: updatedAssignment.assignmentDate,
//           status: updatedAssignment.status,
//           // @ts-ignore
//           worker: updatedAssignment.worker ? {
//             // @ts-ignore
//             id: updatedAssignment.worker.id,
//             // @ts-ignore
//             name: updatedAssignment.worker.name
//           } : null,
//           // @ts-ignore
//           pitak: updatedAssignment.pitak ? {
//             // @ts-ignore
//             id: updatedAssignment.pitak.id,
//             // @ts-ignore
//             name: updatedAssignment.pitak.name
//           } : null
//         }
//       }
//     };

//   } catch (error) {
//     console.error("Error adding note to assignment:", error);
//     return {
//       status: false,
//       // @ts-ignore
//       message: `Failed to add note: ${error.message}`,
//       data: null
//     };
//   }
// };

// src/ipc/assignment/add_note.ipc.js
//@ts-check

const Assignment = require("../../../entities/Assignment");
const { formatNote } = require("./utils/assignmentUtils");

/**
 * Add note to assignment
 * @param {Object} params - Add note parameters
 * @param {import("typeorm").QueryRunner} queryRunner - Transaction query runner
 * @returns {Promise<Object>} Response object
 */
module.exports = async (params, queryRunner) => {
  try {
    const {
      // @ts-ignore
      assignmentId,
      // @ts-ignore
      note,
      // @ts-ignore
      noteType,
      // @ts-ignore
      // @ts-ignore
      userId,
    } = params;

    if (!assignmentId || !note) {
      return {
        status: false,
        message: "Assignment ID and note are required",
        data: null,
      };
    }

    const assignmentRepo = queryRunner.manager.getRepository(Assignment);

    // Find assignment
    const assignment = await assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ["worker", "pitak"],
    });

    if (!assignment) {
      return {
        status: false,
        message: "Assignment not found",
        data: null,
      };
    }

    // 🔑 NEW: Check if assignment is completed/cancelled
    if (
      assignment.status === "completed" ||
      assignment.status === "cancelled"
    ) {
      return {
        status: false,
        message: `Cannot add note. Assignment is already ${assignment.status}.`,
        data: null,
      };
    }

    // Format note using util
    const formattedNote = formatNote(note, noteType);

    // Update assignment
    assignment.notes = assignment.notes
      ? `${assignment.notes}\n${formattedNote}`
      : formattedNote;

    assignment.updatedAt = new Date();

    const updatedAssignment = await assignmentRepo.save(assignment);

    return {
      status: true,
      message: "Note added successfully",
      data: {
        id: updatedAssignment.id,
        note: formattedNote,
        assignment: {
          assignmentDate: updatedAssignment.assignmentDate,
          status: updatedAssignment.status,
          // @ts-ignore
          worker: updatedAssignment.worker
            ? {
                // @ts-ignore
                id: updatedAssignment.worker.id,
                // @ts-ignore
                name: updatedAssignment.worker.name,
              }
            : null,
          // @ts-ignore
          pitak: updatedAssignment.pitak
            ? {
                // @ts-ignore
                id: updatedAssignment.pitak.id,
                // @ts-ignore
                name: updatedAssignment.pitak.name,
              }
            : null,
        },
        summary: {
          assignmentId: updatedAssignment.id,
          // @ts-ignore
          pitakId: updatedAssignment.pitak?.id ?? null,
          // @ts-ignore
          workerId: updatedAssignment.worker?.id ?? null,
          status: updatedAssignment.status,
        },
      },
    };
  } catch (error) {
    console.error("Error adding note to assignment:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to add note: ${error.message}`,
      data: null,
    };
  }
};
