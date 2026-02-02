// ipc/payment/get/by_id.ipc.js
//@ts-check

const Payment = require("../../../../entities/Payment");
const { AppDataSource } = require("../../../db/dataSource");

module.exports = async function getPaymentById(params = {}) {
  try {
    // @ts-ignore
    let { paymentId } = params;

    if (!paymentId) {
      return {
        status: false,
        message: "Payment ID is required",
        data: null,
      };
    }

    // normalize id
    paymentId = parseInt(paymentId, 10);
    if (Number.isNaN(paymentId) || paymentId <= 0) {
      return {
        status: false,
        message: "Payment ID must be a valid positive integer",
        data: null,
      };
    }

    const paymentRepository = AppDataSource.getRepository(Payment);

    // load related entities; include nested relation for debtPayments.debt
    const payment = await paymentRepository.findOne({
      where: { id: paymentId },
      relations: [
        "worker",
        "pitak",
        "history",
        "debtPayments",
        "debtPayments.debt",
        "assignment",
        "session",
      ],
    });

    if (!payment) {
      return {
        status: false,
        message: "Payment not found",
        data: null,
      };
    }

    // Normalize numeric/decimal fields (SQLite returns strings for decimal)
    // @ts-ignore
    const safeNumber = (v) => {
      if (v === null || v === undefined) return 0;
      const n = parseFloat(v);
      return Number.isNaN(n) ? 0 : n;
    };

    // Map related objects to a clean response shape
    const mappedPayment = {
      id: payment.id,
      grossPay: safeNumber(payment.grossPay),
      manualDeduction: safeNumber(payment.manualDeduction),
      netPay: safeNumber(payment.netPay),
      status: payment.status,
      // @ts-ignore
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString() : null,
      paymentMethod: payment.paymentMethod || null,
      referenceNumber: payment.referenceNumber || null,
      // @ts-ignore
      periodStart: payment.periodStart ? new Date(payment.periodStart).toISOString() : null,
      // @ts-ignore
      periodEnd: payment.periodEnd ? new Date(payment.periodEnd).toISOString() : null,
      totalDebtDeduction: safeNumber(payment.totalDebtDeduction),
      otherDeductions: safeNumber(payment.otherDeductions),
      deductionBreakdown: payment.deductionBreakdown || null,
      notes: payment.notes || null,
      idempotencyKey: payment.idempotencyKey || null,
      // @ts-ignore
      createdAt: payment.createdAt ? new Date(payment.createdAt).toISOString() : null,
      // @ts-ignore
      updatedAt: payment.updatedAt ? new Date(payment.updatedAt).toISOString() : null,
      // relations
      // @ts-ignore
      worker: payment.worker
        ? {
            // @ts-ignore
            id: payment.worker.id,
            // @ts-ignore
            name: payment.worker.name || null,
          }
        : null,
      // @ts-ignore
      pitak: payment.pitak
        ? {
            // @ts-ignore
            id: payment.pitak.id,
            // @ts-ignore
            location: payment.pitak.location || null,
          }
        : null,
      // @ts-ignore
      session: payment.session ? { id: payment.session.id } : null,
      // @ts-ignore
      assignment: payment.assignment ? { id: payment.assignment.id } : null,
      history:
        // @ts-ignore
        Array.isArray(payment.history) && payment.history.length
          // @ts-ignore
          ? payment.history.map((h) => ({
              id: h.id,
              action: h.action || null,
              details: h.details || null,
              createdAt: h.createdAt ? new Date(h.createdAt).toISOString() : null,
            }))
          : [],
      debtPayments:
        // @ts-ignore
        Array.isArray(payment.debtPayments) && payment.debtPayments.length
          // @ts-ignore
          ? payment.debtPayments.map((d) => ({
              id: d.id,
              amount: safeNumber(d.amount),
              createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
              debt: d.debt
                ? {
                    id: d.debt.id,
                    description: d.debt.description || null,
                    balance: safeNumber(d.debt.balance),
                  }
                : null,
            }))
          : [],
    };

    return {
      status: true,
      message: "Payment retrieved successfully",
      data: { payment: mappedPayment },
    };
  } catch (error) {
    console.error("Error in getPaymentById:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to retrieve payment: ${error.message}`,
      data: null,
    };
  }
};