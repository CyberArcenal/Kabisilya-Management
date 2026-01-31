// src/utils/assignmentUtils.js
//@ts-check
const { In } = require("typeorm");

/**
 * @param {{ findOne: (arg0: { where: { id: any; }; }) => any; }} pitakRepo
 * @param {any} pitakId
 */
async function validatePitak(pitakRepo, pitakId) {
  const pitak = await pitakRepo.findOne({ where: { id: pitakId } });
  if (!pitak) {
    return { valid: false, message: "Pitak not found" };
  }
  if (pitak.status === "completed") {
    return { valid: false, message: `Pitak ${pitakId} is already completed` };
  }
  return { valid: true, pitak };
}

/**
 * @param {{ findBy: (arg0: { id: import("typeorm").FindOperator<any>; }) => any; }} workerRepo
 * @param {readonly any[] | import("typeorm").FindOperator<any>} workerIds
 */
async function validateWorkers(workerRepo, workerIds) {
  const workers = await workerRepo.findBy({ id: In(workerIds) });
  // @ts-ignore
  if (workers.length !== workerIds.length) {
    const foundIds = workers.map((/** @type {{ id: any; }} */ w) => w.id);
    // @ts-ignore
    const missingIds = workerIds.filter((/** @type {any} */ id) => !foundIds.includes(id));
    return { valid: false, message: `Some workers not found: ${missingIds.join(", ")}` };
  }
  const inactive = workers.filter((/** @type {{ status: string; }} */ w) => w.status !== "active");
  if (inactive.length > 0) {
    return { valid: false, message: `Inactive workers: ${inactive.map((/** @type {{ id: any; status: any; }} */ w) => `${w.id} (${w.status})`).join(", ")}` };
  }
  return { valid: true, workers };
}

/**
 * @param {{ find: (arg0: { where: { worker: { id: import("typeorm").FindOperator<any>; }; pitak: { id: any; }; status: string; }; relations: string[]; }) => any; }} assignmentRepo
 * @param {readonly any[] | import("typeorm").FindOperator<any>} workerIds
 * @param {any} pitakId
 */
async function findAlreadyAssigned(assignmentRepo, workerIds, pitakId) {
  const existing = await assignmentRepo.find({
    where: { worker: { id: In(workerIds) }, pitak: { id: pitakId }, status: "active" },
    relations: ["worker", "pitak"]
  });
  return existing.map((/** @type {{ worker: { id: any; }; }} */ a) => a.worker?.id).filter(Boolean);
}

// src/utils/assignmentUtils.js

/**
 * @param {any} note
 * @param {string} noteType
 */
function formatNote(note, noteType) {
  const timestamp = new Date().toISOString();
  if (!noteType) {
    return `[Note ${timestamp}]: ${note}`;
  }

  switch (noteType.toLowerCase()) {
    case "comment":
      return `[Comment ${timestamp}]: ${note}`;
    case "reminder":
      return `[Reminder ${timestamp}]: ${note}`;
    case "issue":
      return `[Issue ${timestamp}]: ${note}`;
    case "resolution":
      return `[Resolution ${timestamp}]: ${note}`;
    default:
      return `[Note ${timestamp}]: ${note}`;
  }
}

module.exports = {
  validatePitak,
  validateWorkers,
  findAlreadyAssigned,
  formatNote
};