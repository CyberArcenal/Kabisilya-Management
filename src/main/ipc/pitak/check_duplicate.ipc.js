// src/ipc/pitak/check_duplicate.ipc.js
//@ts-check

const { Not } = require("typeorm");
const Pitak = require("../../../entities/Pitak");
const { AppDataSource } = require("../../db/dataSource");

// @ts-ignore
module.exports = async (params) => {
  try {
    const {
      bukidId,
      location,
      excludePitakId = null,
      radiusKm = null,
      // @ts-ignore
      userId,
    } = params;

    if (!bukidId) {
      return { status: false, message: "Bukid ID is required", data: null };
    }

    const pitakRepo = AppDataSource.getRepository(Pitak);

    const duplicates = {
      bukidId,
      location,
      exactMatches: [],
      similarMatches: [],
      nearbyMatches: [],
      hasDuplicates: false,
    };

    // ✅ Exact location match in same bukid
    if (location) {
      const whereClause = { bukid: { id: bukidId }, location };
      if (excludePitakId) {
        // @ts-ignore
        whereClause.id = Not(excludePitakId);
      }

      const exactMatches = await pitakRepo.find({
        where: whereClause,
        relations: ["bukid"],
      });

      if (exactMatches.length > 0) {
        // @ts-ignore
        duplicates.exactMatches = exactMatches.map((p) => ({
          id: p.id,
          location: p.location,
          // @ts-ignore
          totalLuwang: parseFloat(p.totalLuwang),
          status: p.status,
          createdAt: p.createdAt,
        }));
        duplicates.hasDuplicates = true;
      }

      // ✅ Similar locations (case-insensitive, partial match)
      const similarMatches = await pitakRepo
        .createQueryBuilder("pitak")
        .leftJoin("pitak.bukid", "bukid")
        .where("bukid.id = :bukidId", { bukidId })
        .andWhere("LOWER(pitak.location) LIKE LOWER(:location)", {
          location: `%${location}%`,
        })
        .andWhere(excludePitakId ? "pitak.id != :excludePitakId" : "1=1", {
          excludePitakId,
        })
        .getMany();

      if (similarMatches.length > 0) {
        // @ts-ignore
        duplicates.similarMatches = similarMatches
          .filter((p) => !exactMatches.some((em) => em.id === p.id))
          .map((p) => ({
            id: p.id,
            location: p.location,
            // @ts-ignore
            totalLuwang: parseFloat(p.totalLuwang),
            status: p.status,
            similarity: calculateSimilarity(location, p.location),
            createdAt: p.createdAt,
          }));

        if (duplicates.similarMatches.length > 0) {
          duplicates.hasDuplicates = true;
        }
      }
    }

    // ✅ Nearby matches (simplified string similarity)
    if (radiusKm && location) {
      const allPitaksInBukid = await pitakRepo.find({
        // @ts-ignore
        where: { bukid: { id: bukidId } },
        relations: ["bukid"],
      });

      const nearby = allPitaksInBukid.filter((p) => {
        if (p.id === excludePitakId) return false;
        if (!p.location) return false;
        const similarity = calculateSimilarity(location, p.location);
        return similarity > 0.7;
      });

      if (nearby.length > 0) {
        // @ts-ignore
        duplicates.nearbyMatches = nearby.map((p) => ({
          id: p.id,
          location: p.location,
          // @ts-ignore
          totalLuwang: parseFloat(p.totalLuwang),
          status: p.status,
          approximateDistance: "Similar location name",
          createdAt: p.createdAt,
        }));
        duplicates.hasDuplicates = true;
      }
    }

    // Risk assessment
    let riskScore = 0;
    let riskLevel = "low";
    const reasons = [];

    if (duplicates.exactMatches.length > 0) {
      riskScore += 100;
      reasons.push(
        `Exact location match found (${duplicates.exactMatches.length})`,
      );
    }
    if (duplicates.similarMatches.length > 0) {
      riskScore += duplicates.similarMatches.length * 20;
      reasons.push(
        `Similar location matches found (${duplicates.similarMatches.length})`,
      );
    }
    if (duplicates.nearbyMatches.length > 0) {
      riskScore += duplicates.nearbyMatches.length * 10;
      reasons.push(`Nearby pitaks found (${duplicates.nearbyMatches.length})`);
    }

    if (riskScore >= 100) riskLevel = "high";
    else if (riskScore >= 50) riskLevel = "medium";
    else if (riskScore >= 20) riskLevel = "low";
    else riskLevel = "none";

    // @ts-ignore
    duplicates.riskAssessment = {
      score: riskScore,
      level: riskLevel,
      reasons,
      recommendation:
        riskLevel === "high"
          ? "Consider using a different location name"
          : riskLevel === "medium"
            ? "Verify this is not a duplicate"
            : "No significant duplicate risk",
    };

    return {
      status: true,
      message: duplicates.hasDuplicates
        ? "Potential duplicates found"
        : "No duplicates found",
      data: duplicates,
    };
  } catch (error) {
    console.error("Error checking for duplicates:", error);
    return {
      status: false,
      // @ts-ignore
      message: `Failed to check duplicates: ${error.message}`,
      data: null,
    };
  }
};

// Helper function
// @ts-ignore
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1 === s2) return 1;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1;
  if (longer.includes(shorter)) return shorter.length / longer.length;
  const set1 = new Set(s1.split(""));
  const set2 = new Set(s2.split(""));
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}
