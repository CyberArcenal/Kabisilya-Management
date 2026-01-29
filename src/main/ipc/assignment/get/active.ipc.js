// src/ipc/assignment/get/active.ipc.js
//@ts-check
const Assignment = require("../../../../entities/Assignment");
const { AppDataSource } = require("../../../db/dataSource");

/**
 * Get active assignments
 * @param {Object} filters - Additional filters
 * @param {number} userId - User ID for logging
 * @returns {Promise<Object>} Response object
 */
// @ts-ignore
// @ts-ignore
module.exports = async (filters = {}, userId) => {
  try {
    const assignmentRepo = AppDataSource.getRepository(Assignment);
    
    const queryBuilder = assignmentRepo
      .createQueryBuilder("assignment")
      .leftJoinAndSelect("assignment.worker", "worker")
      .leftJoinAndSelect("assignment.pitak", "pitak")
      .where("assignment.status = :status", { status: 'active' })
      .orderBy("assignment.assignmentDate", "DESC");

    // Apply date filters
    // @ts-ignore
    if (filters.dateFrom && filters.dateTo) {
      queryBuilder.andWhere("assignment.assignmentDate BETWEEN :dateFrom AND :dateTo", {
        // @ts-ignore
        dateFrom: filters.dateFrom,
        // @ts-ignore
        dateTo: filters.dateTo
      });
    }

    // Apply worker filter
    // @ts-ignore
    if (filters.workerId) {
      // @ts-ignore
      queryBuilder.andWhere("assignment.workerId = :workerId", { workerId: filters.workerId });
    }

    // Apply pitak filter
    // @ts-ignore
    if (filters.pitakId) {
      // @ts-ignore
      queryBuilder.andWhere("assignment.pitakId = :pitakId", { pitakId: filters.pitakId });
    }

    const assignments = await queryBuilder.getMany();
    
    // Group assignments by date
    const assignmentsByDate = {};
    let totalLuWang = 0;
    let todayCount = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    assignments.forEach((assignment) => {
      // @ts-ignore
      const dateStr = assignment.assignmentDate.toISOString().split('T')[0];
      // @ts-ignore
      const luwang = parseFloat(assignment.luwangCount) || 0;
      
      // @ts-ignore
      if (!assignmentsByDate[dateStr]) {
        // @ts-ignore
        assignmentsByDate[dateStr] = [];
      }
      
      // @ts-ignore
      assignmentsByDate[dateStr].push({
        id: assignment.id,
        luwangCount: luwang.toFixed(2),
        // @ts-ignore
        worker: assignment.worker ? {
          // @ts-ignore
          id: assignment.worker.id,
          // @ts-ignore
          name: assignment.worker.name,
          // @ts-ignore
          code: assignment.worker.code
        } : null,
        // @ts-ignore
        pitak: assignment.pitak ? {
          // @ts-ignore
          id: assignment.pitak.id,
          // @ts-ignore
          name: assignment.pitak.name,
          // @ts-ignore
          code: assignment.pitak.code
        } : null,
        notes: assignment.notes
      });
      
      totalLuWang += luwang;
      
      // Check if assignment is for today
      // @ts-ignore
      const assignmentDate = new Date(assignment.assignmentDate);
      assignmentDate.setHours(0, 0, 0, 0);
      if (assignmentDate.getTime() === today.getTime()) {
        todayCount++;
      }
    });

    // Convert grouped assignments to array and sort by date (newest first)
    const groupedAssignments = Object.entries(assignmentsByDate)
      .map(([date, assignments]) => ({
        date,
        assignments,
        count: assignments.length,
        totalLuWang: assignments.reduce((/** @type {number} */ sum, /** @type {{ luwangCount: string; }} */ a) => sum + parseFloat(a.luwangCount), 0).toFixed(2)
      }))
      // @ts-ignore
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      status: true,
      message: "Active assignments retrieved successfully",
      data: {
        // @ts-ignore
        assignments: assignments.map((/** @type {{ id: any; luwangCount: string; assignmentDate: any; worker: { id: any; name: any; }; pitak: { id: any; name: any; }; }} */ assignment) => ({
          id: assignment.id,
          luwangCount: parseFloat(assignment.luwangCount).toFixed(2),
          assignmentDate: assignment.assignmentDate,
          worker: assignment.worker ? {
            id: assignment.worker.id,
            name: assignment.worker.name
          } : null,
          pitak: assignment.pitak ? {
            id: assignment.pitak.id,
            name: assignment.pitak.name
          } : null
        })),
        groupedByDate: groupedAssignments
      },
      meta: {
        total: assignments.length,
        totalLuWang: totalLuWang.toFixed(2),
        todayCount,
        // @ts-ignore
        uniqueWorkers: new Set(assignments.map((/** @type {{ workerId: any; }} */ a) => a.workerId)).size,
        // @ts-ignore
        uniquePitaks: new Set(assignments.map((/** @type {{ pitakId: any; }} */ a) => a.pitakId)).size
      }
    };

  } catch (error) {
    console.error("Error getting active assignments:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to retrieve active assignments: ${error.message}`,
      data: null
    };
  }
};