// ipc/worker/get/summary.ipc.js
//@ts-check

const Worker = require("../../../../entities/Worker");
const Debt = require("../../../../entities/Debt");
const Payment = require("../../../../entities/Payment");
const Assignment = require("../../../../entities/Assignment");
const { AppDataSource } = require("../../../db/dataSource");

module.exports = async function getWorkerSummary(params = {}) {
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
    const assignmentRepository = AppDataSource.getRepository(Assignment);

    // Get basic worker info
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

    // Get counts and financial data using repositories
    const [
      debtCount,
      debtSummary,
      paymentCount,
      paymentSummary,
      assignmentCount,
      activeAssignmentCount
    ] = await Promise.all([
      // Debt count (active debts)
      debtRepository.count({
        where: {
          // @ts-ignore
          worker: { id: parseInt(id) },
          status: { $in: ['pending', 'partially_paid'] }
        }
      }),
      
      // Debt summary
      debtRepository
        .createQueryBuilder("debt")
        .select([
          "COUNT(*) as totalDebts",
          "SUM(debt.amount) as totalDebt",
          "SUM(CASE WHEN debt.status IN (:...activeStatuses) THEN debt.balance ELSE 0 END) as activeDebt"
        ])
        .where("debt.workerId = :workerId", { workerId: id })
        .setParameter("activeStatuses", ['pending', 'partially_paid'])
        .getRawOne(),
      
      // Payment count
      paymentRepository.count({
        // @ts-ignore
        where: { worker: { id: parseInt(id) } }
      }),
      
      // Payment summary
      paymentRepository
        .createQueryBuilder("payment")
        .select("SUM(payment.netPay)", "totalPaid")
        .where("payment.workerId = :workerId", { workerId: id })
        .getRawOne(),
      
      // Assignment count
      assignmentRepository.count({
        // @ts-ignore
        where: { worker: { id: parseInt(id) } }
      }),
      
      // Active assignment count
      assignmentRepository.count({
        where: { 
          // @ts-ignore
          worker: { id: parseInt(id) },
          status: 'active'
        }
      })
    ]);

    const totalDebt = parseFloat(debtSummary?.totalDebt || 0);
    const totalPaid = parseFloat(paymentSummary?.totalPaid || 0);
    const activeDebt = parseFloat(debtSummary?.activeDebt || 0);
    const currentBalance = totalPaid - activeDebt;

    // Calculate days employed
    let daysEmployed = 0;
    if (worker.hireDate) {
      // @ts-ignore
      const hireDate = new Date(worker.hireDate);
      const today = new Date();
      // @ts-ignore
      daysEmployed = Math.floor((today - hireDate) / (1000 * 60 * 60 * 24));
    }

    return {
      status: true,
      message: 'Worker summary retrieved successfully',
      data: {
        worker,
        summary: {
          basicInfo: {
            name: worker.name,
            status: worker.status,
            hireDate: worker.hireDate,
            daysEmployed: daysEmployed
          },
          counts: {
            totalDebts: debtCount,
            totalPayments: paymentCount,
            totalAssignments: assignmentCount,
            activeAssignments: activeAssignmentCount
          },
          financial: {
            totalDebt: totalDebt,
            totalPaid: totalPaid,
            currentBalance: currentBalance,
            activeDebt: activeDebt
          }
        }
      }
    };
  } catch (error) {
    console.error('Error in getWorkerSummary:', error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to retrieve worker summary: ${error.message}`,
      data: null
    };
  }
};