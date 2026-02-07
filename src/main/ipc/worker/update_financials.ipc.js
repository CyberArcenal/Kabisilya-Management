// ipc/worker/update_financials.ipc.js
//@ts-check

const { AppDataSource } = require("../../db/dataSource");

module.exports = async function updateWorkerFinancials(params = {}, queryRunner = null) {
  try {
    return {
      status: false,
      message: 'Worker financial fields (totalDebt, totalPaid, currentBalance) have been removed. Financial data is now calculated from Debt and Payment entities. Please update financial information through the respective debt and payment APIs.',
      data: null
    };
  } catch (error) {
    console.error('Error in updateWorkerFinancials:', error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to update worker financials: ${error.message}`,
      data: null
    };
  }
};