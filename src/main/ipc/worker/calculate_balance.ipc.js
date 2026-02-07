// ipc/worker/calculate_balance.ipc.js
//@ts-check

const Worker = require("../../../entities/Worker");
const Debt = require("../../../entities/Debt");
const Payment = require("../../../entities/Payment");
const { AppDataSource } = require("../../db/dataSource");

module.exports = async function calculateWorkerBalance(params = {}) {
  try {
    // @ts-ignore
    const { workerId, _userId } = params;

    if (!workerId) {
      return {
        status: false,
        message: "Worker ID is required",
        data: null,
      };
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Get worker
      const workerRepository = queryRunner.manager.getRepository(Worker);
      const worker = await workerRepository.findOne({
        where: { id: parseInt(workerId) },
      });

      if (!worker) {
        await queryRunner.release();
        return {
          status: false,
          message: "Worker not found",
          data: null,
        };
      }

      // Get all active debts
      const debtRepository = queryRunner.manager.getRepository(Debt);
      const activeDebts = await debtRepository.find({
        where: {
          // @ts-ignore
          worker: { id: parseInt(workerId) },
          status: ["pending", "partially_paid"],
        },
      });

      // Get all payments
      const paymentRepository = queryRunner.manager.getRepository(Payment);
      const payments = await paymentRepository.find({
        // @ts-ignore
        where: { worker: { id: parseInt(workerId) } },
      });

      // Calculate totals
      const calculations = {
        debts: {
          totalOriginalAmount: activeDebts.reduce(
            // @ts-ignore
            (sum, debt) => sum + parseFloat(debt.originalAmount || 0),
            0,
          ),
          totalAmount: activeDebts.reduce(
            // @ts-ignore
            (sum, debt) => sum + parseFloat(debt.amount || 0),
            0,
          ),
          totalBalance: activeDebts.reduce(
            // @ts-ignore
            (sum, debt) => sum + parseFloat(debt.balance || 0),
            0,
          ),
          totalInterest: activeDebts.reduce(
            // @ts-ignore
            (sum, debt) => sum + parseFloat(debt.totalInterest || 0),
            0,
          ),
          count: activeDebts.length,
          overdueDebts: activeDebts.filter((debt) => {
            if (!debt.dueDate) return false;
            // @ts-ignore
            return new Date(debt.dueDate) < new Date();
          }),
        },
        payments: {
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
          count: payments.length,
        },
      };

      // Calculate derived values
      const totalDebt = calculations.debts.totalBalance;
      const totalPaid = calculations.payments.totalDebtDeduction;
      const currentBalance = totalDebt - totalPaid;

      // Calculate average net pay
      const averageNetPay =
        payments.length > 0
          ? calculations.payments.totalNetPay / payments.length
          : 0;

      await queryRunner.release();

      return {
        status: true,
        message: "Worker balance calculated successfully",
        data: {
          worker: {
            id: worker.id,
            name: worker.name,
            status: worker.status,
          },
          calculations,
          summary: {
            totalDebt,
            totalPaid,
            currentBalance,
            netPosition: calculations.payments.totalNetPay - totalDebt,
            debtToIncomeRatio:
              calculations.payments.totalNetPay > 0
                ? (totalDebt / calculations.payments.totalNetPay) * 100
                : 0,
            paymentCoverage:
              totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 100,
          },
          recommendations: getFinancialRecommendations(
            totalDebt,
            currentBalance,
            averageNetPay,
          ),
        },
      };
    } catch (error) {
      await queryRunner.release();
      throw error;
    }
  } catch (error) {
    console.error("Error in calculateWorkerBalance:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to calculate worker balance: ${error.message}`,
      data: null,
    };
  }
};

/**
 * Generate financial recommendations based on worker's financial position
 * @param {number} totalDebt
 * @param {number} currentBalance
 * @param {number} averageNetPay
 */
function getFinancialRecommendations(totalDebt, currentBalance, averageNetPay) {
  const recommendations = [];

  if (currentBalance > 0) {
    if (currentBalance > averageNetPay * 3) {
      recommendations.push({
        type: "warning",
        message: "High debt load detected",
        suggestion: "Consider debt restructuring or payment plan",
      });
    }

    if (totalDebt > averageNetPay * 6) {
      recommendations.push({
        type: "critical",
        message: "Very high debt-to-income ratio",
        suggestion: "Immediate action needed. Consider debt consolidation.",
      });
    }

    // Calculate suggested monthly payment
    const suggestedMonthlyPayment = Math.min(
      currentBalance * 0.1,
      averageNetPay * 0.3,
    );
    if (suggestedMonthlyPayment > 0) {
      recommendations.push({
        type: "suggestion",
        message: "Suggested monthly payment",
        suggestion: `Pay ₱${suggestedMonthlyPayment.toFixed(2)} monthly to clear debt in reasonable time`,
      });
    }
  } else {
    recommendations.push({
      type: "positive",
      message: "No outstanding debt",
      suggestion: "Good financial standing",
    });
  }

  return recommendations;
}
