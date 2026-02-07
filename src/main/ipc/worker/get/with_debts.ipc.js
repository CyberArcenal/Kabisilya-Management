// ipc/worker/get/with_debts.ipc.js
//@ts-check

const Worker = require("../../../../entities/Worker");
const Debt = require("../../../../entities/Debt");
const Payment = require("../../../../entities/Payment");
// @ts-ignore
const DebtHistory = require("../../../../entities/DebtHistory");
const { AppDataSource } = require("../../../db/dataSource");

module.exports = async function getWorkerWithDebts(params = {}) {
  try {
    // @ts-ignore
    // @ts-ignore
    const { id, _userId } = params;

    if (!id) {
      return {
        status: false,
        message: 'Worker ID is required',
        data: null
      };
    }

    const workerRepository = AppDataSource.getRepository(Worker);
    const debtRepository = AppDataSource.getRepository(Debt);
    const paymentRepository = AppDataSource.getRepository(Payment);

    const worker = await workerRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['debts', 'debts.history']
    });

    if (!worker) {
      return {
        status: false,
        message: 'Worker not found',
        data: null
      };
    }

    // Get financial summary from repositories
    const [paymentSummary, debtStats] = await Promise.all([
      // Total payments
      paymentRepository
        .createQueryBuilder("payment")
        .select("SUM(payment.netPay)", "totalPaid")
        .where("payment.workerId = :workerId", { workerId: id })
        .getRawOne(),
      
      // Debt statistics
      debtRepository
        .createQueryBuilder("debt")
        .select([
          "COUNT(*) as totalDebts",
          "SUM(CASE WHEN debt.status IN (:...activeStatuses) THEN debt.balance ELSE 0 END) as activeDebt",
          "SUM(CASE WHEN debt.status = 'paid' THEN debt.amount ELSE 0 END) as paidDebt"
        ])
        .where("debt.workerId = :workerId", { workerId: id })
        .setParameter("activeStatuses", ['pending', 'partially_paid'])
        .getRawOne()
    ]);

    const totalPaid = parseFloat(paymentSummary?.totalPaid || 0);
    const activeDebt = parseFloat(debtStats?.activeDebt || 0);
    const paidDebt = parseFloat(debtStats?.paidDebt || 0);
    const totalDebt = activeDebt + paidDebt;
    const currentBalance = totalPaid - activeDebt;

    // Calculate active debts from loaded relations
    // @ts-ignore
    const activeDebts = worker.debts.filter(debt =>
      debt.status === 'pending' || debt.status === 'partially_paid'
    );
    
    const totalActiveDebt = activeDebts.reduce(
      // @ts-ignore
      (sum, debt) => sum + parseFloat(debt.balance || debt.amount || 0), 
      0
    );

    return {
      status: true,
      message: 'Worker with debts retrieved successfully',
      data: { 
        worker: {
          ...worker,
          totalDebt: totalDebt,
          totalPaid: totalPaid,
          currentBalance: currentBalance
        },
        debtSummary: {
          // @ts-ignore
          totalDebts: worker.debts.length,
          activeDebts: activeDebts.length,
          totalActiveDebt: totalActiveDebt,
          // @ts-ignore
          paidDebts: worker.debts.filter(d => d.status === 'paid').length,
          financialSummary: {
            totalPaid: totalPaid,
            activeDebt: activeDebt,
            paidDebt: paidDebt,
            currentBalance: currentBalance
          }
        }
      }
    };
  } catch (error) {
    console.error('Error in getWorkerWithDebts:', error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to retrieve worker debts: ${error.message}`,
      data: null
    };
  }
};