// ipc/worker/get_payment_summary.ipc.js
//@ts-check

const Payment = require("../../../entities/Payment");
const { AppDataSource } = require("../../db/dataSource");

module.exports = async function getWorkerPaymentSummary(params = {}) {
  try {
    const {
      // @ts-ignore
      workerId,
      // @ts-ignore
      periodStart,
      // @ts-ignore
      periodEnd,
      // @ts-ignore
      groupBy = "month",
      // @ts-ignore
      _userId,
    } = params;

    if (!workerId) {
      return {
        status: false,
        message: "Worker ID is required",
        data: null,
      };
    }

    const paymentRepository = AppDataSource.getRepository(Payment);

    // Build query
    const qb = paymentRepository
      .createQueryBuilder("payment")
      .where("payment.workerId = :workerId", { workerId: parseInt(workerId) });

    // Apply date filter if provided
    if (periodStart && periodEnd) {
      qb.andWhere("payment.paymentDate BETWEEN :start AND :end", {
        start: new Date(periodStart),
        end: new Date(periodEnd),
      });
    }

    const payments = await qb.orderBy("payment.paymentDate", "DESC").getMany();

    // Calculate summary
    const summary = {
      totalPayments: payments.length,
      totalGrossPay: payments.reduce(
        // @ts-ignore
        (sum, payment) => sum + parseFloat(payment.grossPay || 0),
        0,
      ),
      totalNetPay: payments.reduce(
        // @ts-ignore
        (sum, payment) => sum + parseFloat(payment.netPay || 0),
        0,
      ),
      totalDebtDeduction: payments.reduce(
        // @ts-ignore
        (sum, payment) => sum + parseFloat(payment.totalDebtDeduction || 0),
        0,
      ),
      totalOtherDeductions: payments.reduce(
        // @ts-ignore
        (sum, payment) => sum + parseFloat(payment.otherDeductions || 0),
        0,
      ),
      byStatus: {
        pending: payments.filter((p) => p.status === "pending").length,
        processing: payments.filter((p) => p.status === "processing").length,
        completed: payments.filter((p) => p.status === "completed").length,
        cancelled: payments.filter((p) => p.status === "cancelled").length,
        partially_paid: payments.filter((p) => p.status === "partially_paid")
          .length,
      },
      byPaymentMethod: {},
      averageNetPay:
        payments.length > 0
          // @ts-ignore
          ? payments.reduce((sum, p) => sum + parseFloat(p.netPay || 0), 0) /
            payments.length
          : 0,
    };

    // Group by payment method
    payments.forEach((payment) => {
      const method = payment.paymentMethod || "Unknown";
      // @ts-ignore
      if (!summary.byPaymentMethod[method]) {
        // @ts-ignore
        summary.byPaymentMethod[method] = {
          count: 0,
          totalAmount: 0,
        };
      }
      // @ts-ignore
      summary.byPaymentMethod[method].count++;
      // @ts-ignore
      summary.byPaymentMethod[method].totalAmount += parseFloat(
        // @ts-ignore
        payment.netPay || 0,
      );
    });

    // Group by time period if requested
    let groupedPayments = {};
    if (groupBy && payments.length > 0) {
      payments.forEach((payment) => {
        let key;
        const date = payment.paymentDate || payment.createdAt;

        if (groupBy === "day") {
          // @ts-ignore
          key = date.toISOString().split("T")[0];
        } else if (groupBy === "week") {
          const weekNum = Math.ceil(
            // @ts-ignore
            (date.getDate() +
              // @ts-ignore
              new Date(date.getFullYear(), date.getMonth(), 1).getDay()) /
              7,
          );
          // @ts-ignore
          key = `${date.getFullYear()}-W${weekNum}`;
        } else if (groupBy === "month") {
          // @ts-ignore
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        } else if (groupBy === "year") {
          // @ts-ignore
          key = date.getFullYear().toString();
        }

        // @ts-ignore
        if (!groupedPayments[key]) {
          // @ts-ignore
          groupedPayments[key] = {
            period: key,
            count: 0,
            totalNetPay: 0,
            totalGrossPay: 0,
            averageNetPay: 0,
          };
        }
        // @ts-ignore
        groupedPayments[key].count++;
        // @ts-ignore
        groupedPayments[key].totalNetPay += parseFloat(payment.netPay || 0);
        // @ts-ignore
        groupedPayments[key].totalGrossPay += parseFloat(payment.grossPay || 0);
      });

      // Calculate averages for each period
      Object.keys(groupedPayments).forEach((key) => {
        // @ts-ignore
        groupedPayments[key].averageNetPay =
          // @ts-ignore
          groupedPayments[key].totalNetPay / groupedPayments[key].count;
      });

      // Convert to array and sort
      groupedPayments = Object.values(groupedPayments).sort((a, b) =>
        a.period.localeCompare(b.period),
      );
    }

    return {
      status: true,
      message: "Worker payment summary retrieved successfully",
      data: {
        payments,
        summary,
        groupedPayments,
        recentPayments: payments.slice(0, 10), // Last 10 payments
      },
    };
  } catch (error) {
    console.error("Error in getWorkerPaymentSummary:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to retrieve worker payment summary: ${error.message}`,
      data: null,
    };
  }
};
