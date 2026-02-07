// src/ipc/assignment/update_status.ipc.js
//@ts-check

const Assignment = require("../../../entities/Assignment");
const Pitak = require("../../../entities/Pitak");
const Payment = require("../../../entities/Payment");
const PaymentHistory = require("../../../entities/PaymentHistory");
const { validatePitak } = require("./utils/assignmentUtils");
const {
  farmRatePerLuwang,
  farmSessionDefaultSessionId,
} = require("../../../utils/system");
const { generateReferenceNumber } = require("../debt/utils/reference");

// @ts-ignore
module.exports = async (params, queryRunner) => {
  try {
    const { assignmentId, status, notes, _userId } = params || {};

    if (!assignmentId || !status) {
      return {
        status: false,
        message:
          "Missing required fields: assignmentId and status are required",
        data: null,
      };
    }

    const validStatuses = ["active", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return {
        status: false,
        message: "Invalid status. Must be one of: active, completed, cancelled",
        data: null,
      };
    }

    if (!queryRunner) {
      return {
        status: false,
        message: "QueryRunner (transaction) is required",
        data: null,
      };
    }

    const assignmentRepo = queryRunner.manager.getRepository(Assignment);
    const pitakRepo = queryRunner.manager.getRepository(Pitak);

    const assignment = await assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ["worker", "pitak", "session"],
    });

    if (!assignment)
      return { status: false, message: "Assignment not found", data: null };

    const pitakCheck = await validatePitak(
      queryRunner.manager.getRepository(Pitak),
      assignment.pitak?.id,
    );
    if (!pitakCheck.valid)
      return { status: false, message: pitakCheck.message, data: null };

    if (assignment.status === status) {
      return {
        status: false,
        message: `Assignment is already ${status}`,
        data: assignment,
      };
    }

    const previousStatus = assignment.status;

    // Prevent cancelling completed assignments
    if (status === "cancelled" && previousStatus === "completed") {
      return {
        status: false,
        message: "Cannot cancel a completed assignment",
        data: null,
      };
    }

    let paymentCreated = false;
    let paymentSkipped = false;
    let createdPaymentId = null;
    let redistributionData = null;
    let lockedAssignmentsData = null;

    // Handle COMPLETED status (payment creation)
    if (status === "completed") {
      // ✅ Hard validation: all relations must exist
      if (
        !assignment.id ||
        !assignment.worker?.id ||
        !assignment.pitak?.id ||
        !assignment.session?.id
      ) {
        return {
          status: false,
          message:
            "Cannot generate payment: missing assignment, worker, pitak, or session relation",
          data: null,
        };
      }

      const ratePerLuwang = await farmRatePerLuwang();
      const sessionId = await farmSessionDefaultSessionId();
      const referenceNumber = generateReferenceNumber("PAY");

      const luwangCount = Number(assignment.luwangCount || 0);
      const grossPay = parseFloat((luwangCount * ratePerLuwang).toFixed(2));

      const paymentRepo = queryRunner.manager.getRepository(Payment);
      const paymentHistoryRepo =
        queryRunner.manager.getRepository(PaymentHistory);

      let existingPayment = await paymentRepo.findOne({
        where: { assignment: { id: assignment.id } },
      });

      if (!existingPayment) {
        existingPayment = await paymentRepo.findOne({
          where: {
            pitak: { id: assignment.pitak.id },
            worker: { id: assignment.worker.id },
            session: { id: sessionId },
          },
        });
      }

      if (existingPayment) {
        paymentSkipped = true;
        createdPaymentId = existingPayment.id;
      } else {
        const payment = paymentRepo.create({
          assignment: { id: assignment.id },
          worker: { id: assignment.worker.id },
          pitak: { id: assignment.pitak.id },
          session: { id: assignment.session.id || sessionId },
          grossPay,
          netPay: grossPay,
          manualDeduction: 0.0,
          totalDebtDeduction: 0.0,
          otherDeductions: 0.0,
          deductionBreakdown: null,
          status: "pending",
          paymentMethod: "cash",
          referenceNumber,
          periodStart: assignment.assignmentDate,
          periodEnd: assignment.assignmentDate,
          notes: `Auto-generated from assignment completion (assignment:${assignment.id})`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const savedPayment = await paymentRepo.save(payment);

        const history = paymentHistoryRepo.create({
          payment: savedPayment,
          actionType: "create",
          changedField: "status",
          oldValue: null,
          newValue: "pending",
          oldAmount: 0.0,
          newAmount: grossPay,
          notes: "Payment auto-generated from assignment completion",
          performedBy: _userId ? String(_userId) : null,
          changeDate: new Date(),
        });
        await paymentHistoryRepo.save(history);

        paymentCreated = true;
        createdPaymentId = savedPayment.id;
      }
    }

    // Handle CANCELLED status (redistribution similar to delete.ipc.js)
    if (status === "cancelled" && previousStatus === "active") {
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
      
      // Exclude the current assignment (being cancelled) and completed ones
      const activeAssignments = allAssignments.filter(
        // @ts-ignore
        (a) => a.status === "active" && a.id !== assignment.id,
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
          a.updatedAt = new Date();
          await assignmentRepo.save(a);
        }
      }

      // Prepare redistribution data for response
      // @ts-ignore
      redistributionData = activeAssignments.map((a) => ({
        id: a.id,
        workerId: a.worker?.id ?? null,
        newLuWang: a.luwangCount,
      }));

      // @ts-ignore
      lockedAssignmentsData = completedAssignments.map((a) => ({
        id: a.id,
        workerId: a.worker?.id ?? null,
        luWang: a.luwangCount,
      }));
    }

    // Update assignment status and notes
    assignment.status = status;
    assignment.updatedAt = new Date();

    if (notes) {
      const statusNote = `[Status Change ${previousStatus.toUpperCase()} → ${status.toUpperCase()}]: ${notes}`;
      assignment.notes = assignment.notes
        ? `${assignment.notes}\n${statusNote}`
        : statusNote;
    }

    // Update payment generation metadata if fields exist
    if (typeof assignment.paymentGenerated !== "undefined") {
      assignment.paymentGenerated =
        paymentCreated || paymentSkipped ? true : assignment.paymentGenerated;
    }
    if (
      typeof assignment.paymentGeneratedAt !== "undefined" &&
      (paymentCreated || paymentSkipped)
    ) {
      assignment.paymentGeneratedAt = new Date();
    }

    const updatedAssignment = await assignmentRepo.save(assignment);

    // Prepare response based on status
    const response = {
      status: true,
      data: {
        id: updatedAssignment.id,
        previousStatus,
        newStatus: updatedAssignment.status,
        assignmentDate: updatedAssignment.assignmentDate,
        worker: updatedAssignment.worker
          ? {
              id: updatedAssignment.worker.id,
              name: updatedAssignment.worker.name,
            }
          : null,
        pitak: updatedAssignment.pitak
          ? {
              id: updatedAssignment.pitak.id,
              name: updatedAssignment.pitak.name,
            }
          : null,
        summary: {
          assignmentId: updatedAssignment.id,
          pitakId: updatedAssignment.pitak?.id ?? null,
          workerId: updatedAssignment.worker?.id ?? null,
          status: updatedAssignment.status,
        },
      },
    };

    // Add status-specific data to response
    if (status === "completed") {
      // @ts-ignore
      response.message = `Assignment status updated to ${status}${
        paymentCreated 
          ? " and payment created." 
          : paymentSkipped 
          ? " (payment already existed, skipped creation)." 
          : ""
      }`;
      // @ts-ignore
      response.data.payment = {
        created: paymentCreated,
        skipped: paymentSkipped,
        paymentId: createdPaymentId,
      };
    } else if (status === "cancelled") {
      // @ts-ignore
      response.message = previousStatus === "active"
        ? "Assignment cancelled and LuWang redistributed"
        : "Assignment status updated to cancelled";
      
      if (previousStatus === "active") {
        // @ts-ignore
        response.data.redistribution = redistributionData;
        // @ts-ignore
        response.data.lockedAssignments = lockedAssignmentsData;
      }
    } else {
      // @ts-ignore
      response.message = `Assignment status updated to ${status}`;
    }

    return response;

  } catch (error) {
    console.error("Error updating assignment status:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to update assignment status: ${error.message}`,
      data: null,
    };
  }
};

// // src/ipc/assignment/update_status.ipc.js
// //@ts-check

// const Assignment = require("../../../entities/Assignment");
// const Pitak = require("../../../entities/Pitak");
// const Payment = require("../../../entities/Payment");
// const PaymentHistory = require("../../../entities/PaymentHistory");
// const { validatePitak } = require("./utils/assignmentUtils");
// const {
//   farmRatePerLuwang,
//   farmSessionDefaultSessionId,
// } = require("../../../utils/system");
// const { generateReferenceNumber } = require("../debt/utils/reference");

// // @ts-ignore
// module.exports = async (params, queryRunner) => {
//   try {
//     const { assignmentId, status, notes, _userId } = params || {};

//     if (!assignmentId || !status) {
//       return {
//         status: false,
//         message:
//           "Missing required fields: assignmentId and status are required",
//         data: null,
//       };
//     }

//     const validStatuses = ["active", "completed", "cancelled"];
//     if (!validStatuses.includes(status)) {
//       return {
//         status: false,
//         message: "Invalid status. Must be one of: active, completed, cancelled",
//         data: null,
//       };
//     }

//     if (!queryRunner) {
//       return {
//         status: false,
//         message: "QueryRunner (transaction) is required",
//         data: null,
//       };
//     }

//     const assignmentRepo = queryRunner.manager.getRepository(Assignment);

//     const assignment = await assignmentRepo.findOne({
//       where: { id: assignmentId },
//       relations: ["worker", "pitak", "session"],
//     });

//     if (!assignment)
//       return { status: false, message: "Assignment not found", data: null };

//     const pitakCheck = await validatePitak(
//       queryRunner.manager.getRepository(Pitak),
//       assignment.pitak?.id,
//     );
//     if (!pitakCheck.valid)
//       return { status: false, message: pitakCheck.message, data: null };

//     if (assignment.status === status) {
//       return {
//         status: false,
//         message: `Assignment is already ${status}`,
//         data: assignment,
//       };
//     }

//     if (status === "cancelled" && assignment.status === "completed") {
//       return {
//         status: false,
//         message: "Cannot cancel a completed assignment",
//         data: null,
//       };
//     }

//     const previousStatus = assignment.status;

//     let paymentCreated = false;
//     let paymentSkipped = false;
//     let createdPaymentId = null;

//     if (status === "completed") {
//       // ✅ Hard validation: all relations must exist
//       if (
//         !assignment.id ||
//         !assignment.worker?.id ||
//         !assignment.pitak?.id ||
//         !assignment.session?.id
//       ) {
//         return {
//           status: false,
//           message:
//             "Cannot generate payment: missing assignment, worker, pitak, or session relation",
//           data: null,
//         };
//       }

//       const ratePerLuwang = await farmRatePerLuwang();
//       const sessionId = await farmSessionDefaultSessionId();
//       const referenceNumber = generateReferenceNumber("PAY");

//       const luwangCount = Number(assignment.luwangCount || 0);
//       const grossPay = parseFloat((luwangCount * ratePerLuwang).toFixed(2));

//       const paymentRepo = queryRunner.manager.getRepository(Payment);
//       const paymentHistoryRepo =
//         queryRunner.manager.getRepository(PaymentHistory);

//       let existingPayment = await paymentRepo.findOne({
//         where: { assignment: { id: assignment.id } },
//       });

//       if (!existingPayment) {
//         existingPayment = await paymentRepo.findOne({
//           where: {
//             pitak: { id: assignment.pitak.id },
//             worker: { id: assignment.worker.id },
//             session: { id: sessionId },
//           },
//         });
//       }

//       if (existingPayment) {
//         paymentSkipped = true;
//         createdPaymentId = existingPayment.id;
//       } else {
//         const payment = paymentRepo.create({
//           assignment: { id: assignment.id },
//           worker: { id: assignment.worker.id },
//           pitak: { id: assignment.pitak.id },
//           session: { id: assignment.session.id || sessionId },
//           grossPay,
//           netPay: grossPay,
//           manualDeduction: 0.0,
//           totalDebtDeduction: 0.0,
//           otherDeductions: 0.0,
//           deductionBreakdown: null,
//           status: "pending",
//           paymentMethod: "cash",
//           referenceNumber,
//           periodStart: assignment.assignmentDate,
//           periodEnd: assignment.assignmentDate,
//           notes: `Auto-generated from assignment completion (assignment:${assignment.id})`,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         });

//         const savedPayment = await paymentRepo.save(payment);

//         const history = paymentHistoryRepo.create({
//           payment: savedPayment,
//           actionType: "create",
//           changedField: "status",
//           oldValue: null,
//           newValue: "pending",
//           oldAmount: 0.0,
//           newAmount: grossPay,
//           notes: "Payment auto-generated from assignment completion",
//           performedBy: _userId ? String(_userId) : null,
//           changeDate: new Date(),
//         });
//         await paymentHistoryRepo.save(history);

//         paymentCreated = true;
//         createdPaymentId = savedPayment.id;
//       }
//     }

//     assignment.status = status;
//     assignment.updatedAt = new Date();

//     if (notes) {
//       const statusNote = `[Status Change ${previousStatus.toUpperCase()} → ${status.toUpperCase()}]: ${notes}`;
//       assignment.notes = assignment.notes
//         ? `${assignment.notes}\n${statusNote}`
//         : statusNote;
//     }

//     if (typeof assignment.paymentGenerated !== "undefined") {
//       assignment.paymentGenerated =
//         paymentCreated || paymentSkipped ? true : assignment.paymentGenerated;
//     }
//     if (
//       typeof assignment.paymentGeneratedAt !== "undefined" &&
//       (paymentCreated || paymentSkipped)
//     ) {
//       assignment.paymentGeneratedAt = new Date();
//     }

//     const updatedAssignment = await assignmentRepo.save(assignment);

//     return {
//       status: true,
//       message: `Assignment status updated to ${status}${status === "completed" ? (paymentCreated ? " and payment created." : paymentSkipped ? " (payment already existed, skipped creation)." : "") : ""}`,
//       data: {
//         id: updatedAssignment.id,
//         previousStatus,
//         newStatus: updatedAssignment.status,
//         assignmentDate: updatedAssignment.assignmentDate,
//         worker: updatedAssignment.worker
//           ? {
//               id: updatedAssignment.worker.id,
//               name: updatedAssignment.worker.name,
//             }
//           : null,
//         pitak: updatedAssignment.pitak
//           ? {
//               id: updatedAssignment.pitak.id,
//               name: updatedAssignment.pitak.name,
//             }
//           : null,
//         payment:
//           status === "completed"
//             ? {
//                 created: paymentCreated,
//                 skipped: paymentSkipped,
//                 paymentId: createdPaymentId,
//               }
//             : null,
//         summary: {
//           assignmentId: updatedAssignment.id,
//           pitakId: updatedAssignment.pitak?.id ?? null,
//           workerId: updatedAssignment.worker?.id ?? null,
//           status: updatedAssignment.status,
//         },
//       },
//     };
//   } catch (error) {
//     console.error("Error updating assignment status:", error);
//     return {
//       status: false,
//       // @ts-ignore
//       message: `Failed to update assignment status: ${error.message}`,
//       data: null,
//     };
//   }
// };
