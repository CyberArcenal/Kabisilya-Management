// ipc/worker/get/active.ipc.js (Optimized, no kabisilya)
//@ts-check

const Worker = require("../../../../entities/Worker");
const Debt = require("../../../../entities/Debt");
const Payment = require("../../../../entities/Payment");
const { AppDataSource } = require("../../../db/dataSource");

module.exports = async function getActiveWorkers(params = {}) {
  try {
    const { 
      // @ts-ignore
      page = 1, 
      // @ts-ignore
      limit = 100, 
      // @ts-ignore
      sortBy = 'name', 
      // @ts-ignore
      sortOrder = 'ASC',
      // @ts-ignore
      includeStats = false,
      // @ts-ignore
      _userId 
    } = params;

    const workerRepository = AppDataSource.getRepository(Worker);
    const debtRepository = AppDataSource.getRepository(Debt);
    const paymentRepository = AppDataSource.getRepository(Payment);

    const [workers, total] = await workerRepository.findAndCount({
      where: { status: 'active' },
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    });

    // Calculate additional stats if requested
    /**
     * @type {{ totalWorkers?: any; totalActive?: any; totalBalance?: any; totalDebt?: any; averageBalance?: number; averageDebt?: number; } | null}
     */
    let stats = null;
    if (includeStats) {
      // Get financial data for all active workers in batch
      const workerIds = workers.map(w => w.id);
      
      if (workerIds.length > 0) {
        // Get total payments for these workers
        const paymentResults = await paymentRepository
          .createQueryBuilder("payment")
          .select("payment.workerId", "workerId")
          .addSelect("SUM(payment.netPay)", "totalPaid")
          .where("payment.workerId IN (:...ids)", { ids: workerIds })
          .groupBy("payment.workerId")
          .getRawMany();

        // Get active debts for these workers
        const debtResults = await debtRepository
          .createQueryBuilder("debt")
          .select("debt.workerId", "workerId")
          .addSelect("SUM(debt.balance)", "activeDebt")
          .where("debt.workerId IN (:...ids)", { ids: workerIds })
          .andWhere("debt.status IN (:...statuses)", { 
            statuses: ['pending', 'partially_paid'] 
          })
          .groupBy("debt.workerId")
          .getRawMany();

        // Create lookup maps
        const paymentsMap = new Map();
        paymentResults.forEach(p => {
          paymentsMap.set(p.workerId, parseFloat(p.totalPaid) || 0);
        });

        const debtsMap = new Map();
        debtResults.forEach(d => {
          debtsMap.set(d.workerId, parseFloat(d.activeDebt) || 0);
        });

        // Calculate totals
        let totalBalance = 0;
        let totalDebt = 0;

        workers.forEach(worker => {
          const workerPaid = paymentsMap.get(worker.id) || 0;
          const workerDebt = debtsMap.get(worker.id) || 0;
          const workerBalance = workerPaid - workerDebt;
          
          totalBalance += workerBalance;
          totalDebt += workerDebt;
        });

        stats = {
          totalWorkers: total,
          totalActive: total,
          totalBalance: totalBalance,
          totalDebt: totalDebt,
          averageBalance: total > 0 ? totalBalance / total : 0,
          averageDebt: total > 0 ? totalDebt / total : 0
        };
      } else {
        stats = {
          totalWorkers: total,
          totalActive: total,
          totalBalance: 0,
          totalDebt: 0,
          averageBalance: 0,
          averageDebt: 0
        };
      }
    }

    return {
      status: true,
      message: 'Active workers retrieved successfully',
      data: {
        workers,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    console.error('Error in getActiveWorkers:', error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to retrieve active workers: ${error.message}`,
      data: null
    };
  }
};