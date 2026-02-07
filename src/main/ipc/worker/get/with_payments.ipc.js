// ipc/worker/get/with_payments.ipc.js (Optimized, no kabisilya)
//@ts-check

const Worker = require("../../../../entities/Worker");
const Payment = require("../../../../entities/Payment");
const Debt = require("../../../../entities/Debt");
const { AppDataSource } = require("../../../db/dataSource");

module.exports = async function getWorkerWithPayments(params = {}) {
  try {
    // @ts-ignore
    // @ts-ignore
    const { id, periodStart, periodEnd, includeDetails = true, _userId } = params;

    if (!id) {
      return {
        status: false,
        message: 'Worker ID is required',
        data: null
      };
    }

    const workerRepository = AppDataSource.getRepository(Worker);
    const paymentRepository = AppDataSource.getRepository(Payment);
    const debtRepository = AppDataSource.getRepository(Debt);

    const worker = await workerRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!worker) {
      return {
        status: false,
        message: 'Worker not found',
        data: null
      };
    }

    // Get financial summary
    const [debtSummary, paymentSummary] = await Promise.all([
      // Active debt
      debtRepository
        .createQueryBuilder("debt")
        .select("SUM(debt.balance)", "totalDebt")
        .where("debt.workerId = :workerId", { workerId: id })
        .andWhere("debt.status IN (:...statuses)", {
          statuses: ['pending', 'partially_paid']
        })
        .getRawOne(),
      
      // Total paid
      paymentRepository
        .createQueryBuilder("payment")
        .select("SUM(payment.netPay)", "totalPaid")
        .where("payment.workerId = :workerId", { workerId: id })
        .getRawOne()
    ]);

    const totalDebt = parseFloat(debtSummary?.totalDebt || 0);
    const totalPaid = parseFloat(paymentSummary?.totalPaid || 0);
    const currentBalance = totalPaid - totalDebt;

    // Get payments with optional filters
    let paymentsQuery = paymentRepository
      .createQueryBuilder("payment")
      .where("payment.workerId = :workerId", { workerId: id });

    if (periodStart && periodEnd) {
      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      paymentsQuery = paymentsQuery
        .andWhere("(payment.paymentDate BETWEEN :start AND :end OR payment.createdAt BETWEEN :start AND :end)", {
          start: startDate,
          end: endDate
        });
    }

    const filteredPayments = includeDetails ? 
      await paymentsQuery
        .orderBy("payment.paymentDate", "DESC")
        .addOrderBy("payment.createdAt", "DESC")
        .getMany() :
      [];

    // Calculate totals from filtered payments
    const totalPayments = filteredPayments.length;
    const totalNetPay = filteredPayments.reduce((sum, payment) =>
      // @ts-ignore
      sum + parseFloat(payment.netPay || 0), 0
    );
    const totalGrossPay = filteredPayments.reduce((sum, payment) =>
      // @ts-ignore
      sum + parseFloat(payment.grossPay || 0), 0
    );
    const totalDebtDeduction = filteredPayments.reduce((sum, payment) =>
      // @ts-ignore
      sum + parseFloat(payment.totalDebtDeduction || 0), 0
    );
    const totalOtherDeductions = filteredPayments.reduce((sum, payment) =>
      // @ts-ignore
      sum + parseFloat(payment.otherDeductions || 0), 0
    );

    // Group by payment method
    const paymentsByMethod = {};
    filteredPayments.forEach(payment => {
      const method = payment.paymentMethod || 'Unknown';
      // @ts-ignore
      if (!paymentsByMethod[method]) {
        // @ts-ignore
        paymentsByMethod[method] = {
          count: 0,
          totalAmount: 0,
          payments: []
        };
      }
      // @ts-ignore
      paymentsByMethod[method].count++;
      // @ts-ignore
      paymentsByMethod[method].totalAmount += parseFloat(payment.netPay || 0);
      if (includeDetails) {
        // @ts-ignore
        paymentsByMethod[method].payments.push({
          id: payment.id,
          amount: payment.netPay,
          date: payment.paymentDate,
          status: payment.status
        });
      }
    });

    // Group by status
    const paymentsByStatus = {};
    filteredPayments.forEach(payment => {
      const status = payment.status || 'unknown';
      // @ts-ignore
      if (!paymentsByStatus[status]) {
        // @ts-ignore
        paymentsByStatus[status] = {
          count: 0,
          totalAmount: 0
        };
      }
      // @ts-ignore
      paymentsByStatus[status].count++;
      // @ts-ignore
      paymentsByStatus[status].totalAmount += parseFloat(payment.netPay || 0);
    });

    // Get recent payments
    const recentPayments = filteredPayments
      .slice(0, 10)
      .map(payment => ({
        id: payment.id,
        date: payment.paymentDate,
        netPay: payment.netPay,
        status: payment.status,
        method: payment.paymentMethod
      }));

    // Calculate period days if specified
    let periodDays = null;
    if (periodStart && periodEnd) {
      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      // @ts-ignore
      periodDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    return {
      status: true,
      message: 'Worker with payments retrieved successfully',
      data: { 
        worker: {
          id: worker.id,
          name: worker.name,
          totalDebt: totalDebt,
          totalPaid: totalPaid,
          currentBalance: currentBalance
        },
        paymentSummary: {
          totalPayments,
          totalGrossPay,
          totalNetPay,
          totalDeductions: totalDebtDeduction + totalOtherDeductions,
          breakdown: {
            debtDeduction: totalDebtDeduction,
            otherDeductions: totalOtherDeductions
          },
          averageNetPay: totalPayments > 0 ? totalNetPay / totalPayments : 0,
          averageGrossPay: totalPayments > 0 ? totalGrossPay / totalPayments : 0,
          paymentsByMethod: Object.entries(paymentsByMethod).map(([method, data]) => ({
            method,
            count: data.count,
            totalAmount: data.totalAmount,
            percentage: totalNetPay > 0 ? (data.totalAmount / totalNetPay) * 100 : 0,
            payments: data.payments
          })),
          paymentsByStatus: Object.entries(paymentsByStatus).map(([status, data]) => ({
            status,
            count: data.count,
            totalAmount: data.totalAmount
          })),
          recentPayments
        },
        period: periodStart && periodEnd ? {
          start: periodStart,
          end: periodEnd,
          days: periodDays
        } : null
      }
    };
  } catch (error) {
    console.error('Error in getWorkerWithPayments:', error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to retrieve worker payments: ${error.message}`,
      data: null
    };
  }
};