// ipc/worker/get/stats.ipc.js
//@ts-check

const Worker = require("../../../../entities/Worker");
const Debt = require("../../../../entities/Debt");
const Payment = require("../../../../entities/Payment");
const { AppDataSource } = require("../../../db/dataSource");

module.exports = async function getWorkerStats(params = {}) {
  try {
    // @ts-ignore
    const { _userId } = params;

    const workerRepository = AppDataSource.getRepository(Worker);
    const debtRepository = AppDataSource.getRepository(Debt);
    const paymentRepository = AppDataSource.getRepository(Payment);

    // Get worker counts using repository
    const [totalWorkers, activeWorkers, inactiveWorkers, onLeaveWorkers, terminatedWorkers] = await Promise.all([
      workerRepository.count(),
      workerRepository.count({ where: { status: 'active' } }),
      workerRepository.count({ where: { status: 'inactive' } }),
      workerRepository.count({ where: { status: 'on-leave' } }),
      workerRepository.count({ where: { status: 'terminated' } })
    ]);

    // Get workers by status distribution
    const workersByStatus = await workerRepository
      .createQueryBuilder("worker")
      .select("worker.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("worker.status")
      .orderBy("count", "DESC")
      .getRawMany();

    // Get recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHires = await workerRepository.count({
      where: {
        hireDate: { $gte: thirtyDaysAgo },
        status: 'active'
      }
    });

    // Get financial statistics using repositories
    const [paymentStats, debtStats] = await Promise.all([
      // Total payments for active workers
      paymentRepository
        .createQueryBuilder("payment")
        .select("SUM(payment.netPay)", "totalPaid")
        .leftJoin("payment.worker", "worker")
        .where("worker.status = :status", { status: 'active' })
        .getRawOne(),
      
      // Active debt for active workers
      debtRepository
        .createQueryBuilder("debt")
        .select("SUM(debt.balance)", "totalDebt")
        .leftJoin("debt.worker", "worker")
        .where("worker.status = :status", { status: 'active' })
        .andWhere("debt.status IN (:...statuses)", {
          statuses: ['pending', 'partially_paid']
        })
        .getRawOne()
    ]);

    const totalPaid = parseFloat(paymentStats?.totalPaid || 0);
    const totalDebt = parseFloat(debtStats?.totalDebt || 0);
    const totalBalance = totalPaid - totalDebt;
    const activeCount = activeWorkers || 0;

    // Format the results
    const stats = {
      totals: {
        all: totalWorkers,
        active: activeWorkers,
        inactive: inactiveWorkers,
        onLeave: onLeaveWorkers,
        terminated: terminatedWorkers
      },
      distribution: {
        byStatus: workersByStatus.map(row => ({
          status: row.status,
          count: parseInt(row.count)
        }))
      },
      financial: {
        totalBalance: totalBalance,
        totalDebt: totalDebt,
        totalPaid: totalPaid,
        averageBalance: activeCount > 0 ? totalBalance / activeCount : 0,
        averageDebt: activeCount > 0 ? totalDebt / activeCount : 0
      },
      trends: {
        recentHires: recentHires,
        hireRate: recentHires / 30 // hires per day
      },
      percentages: {
        activeRate: totalWorkers > 0 ? (activeWorkers / totalWorkers) * 100 : 0,
        turnoverRate: totalWorkers > 0 ? (terminatedWorkers / totalWorkers) * 100 : 0
      }
    };

    return {
      status: true,
      message: 'Worker statistics retrieved successfully',
      data: { stats }
    };
  } catch (error) {
    console.error('Error in getWorkerStats:', error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to retrieve worker statistics: ${error.message}`,
      data: null
    };
  }
};