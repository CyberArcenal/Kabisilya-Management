// src/ipc/auditTrail/get/stats.ipc.js
//@ts-check

const { AppDataSource } = require("../../../db/dataSource");

module.exports = async function getAuditTrailStats(params = {}) {
  try {
    // @ts-ignore
    const { userId } = params;
    const auditRepo = AppDataSource.getRepository("AuditTrail");

    // Total count
    const totalCount = await auditRepo.count();

    // Today count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await auditRepo.count({
      where: {
        timestamp:
          AppDataSource.driver.options.type === "sqlite"
            ? { $gte: today } // fallback for SQLite
            : { $gte: today },
      },
    });

    // Last week count
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekCount = await auditRepo.count({
      where: { timestamp: { $gte: lastWeek } },
    });

    // Top actions
    const topActions = await auditRepo
      .createQueryBuilder("audit")
      .select("audit.action", "action")
      .addSelect("COUNT(*)", "count")
      .groupBy("audit.action")
      .orderBy("count", "DESC")
      .limit(10)
      .getRawMany();

    // Top actors
    const topActors = await auditRepo
      .createQueryBuilder("audit")
      .select("audit.actor", "actor")
      .addSelect("COUNT(*)", "count")
      .groupBy("audit.actor")
      .orderBy("count", "DESC")
      .limit(10)
      .getRawMany();

    // Hourly activity (SQLite compatible)
    const hourlyActivity = await auditRepo
      .createQueryBuilder("audit")
      .select("strftime('%H', audit.timestamp)", "hour")
      .addSelect("COUNT(*)", "count")
      .where("date(audit.timestamp) = date('now')")
      .groupBy("strftime('%H', audit.timestamp)")
      .orderBy("hour", "ASC")
      .getRawMany();

    // Log access
    const accessLogRepo = AppDataSource.getRepository("AuditTrail");
    const accessLog = accessLogRepo.create({
      action: "view_audit_trail_stats",
      actor: `User ${userId}`,
      details: {},
      timestamp: new Date(),
    });
    await accessLogRepo.save(accessLog);

    return {
      status: true,
      message: "Audit trail statistics retrieved successfully",
      data: {
        stats: {
          totalCount,
          todayCount,
          lastWeekCount,
          topActions,
          topActors,
          hourlyActivity,
        },
      },
    };
  } catch (error) {
    console.error("Error in getAuditTrailStats:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to retrieve audit trail statistics: ${error.message}`,
      data: null,
    };
  }
};
