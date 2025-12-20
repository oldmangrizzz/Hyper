// Bed Management and Gender Validation
// Implements bed assignment logic with gender restrictions

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Validate bed assignment for gender restrictions (Hard Stop)
 */
export const validateBedAssignment = query({
  args: {
    bedId: v.id("beds"),
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const bed = await ctx.db.get(args.bedId);
    const patient = await ctx.db.get(args.patientId);

    if (!bed) {
      return {
        isValid: false,
        severity: "HardStop",
        code: "BED_NOT_FOUND",
        message: "Bed not found.",
      };
    }

    if (!patient) {
      return {
        isValid: false,
        severity: "HardStop",
        code: "PATIENT_NOT_FOUND",
        message: "Patient not found.",
      };
    }

    // Check bed availability
    if (bed.status !== "Available") {
      return {
        isValid: false,
        severity: "HardStop",
        code: "BED_NOT_AVAILABLE",
        message: `Bed is ${bed.status}, not available for assignment.`,
      };
    }

    // Get room information
    const room = await ctx.db.get(bed.roomId);
    if (!room) {
      return {
        isValid: false,
        severity: "HardStop",
        code: "ROOM_NOT_FOUND",
        message: "Room not found for this bed.",
      };
    }

    // Check gender restrictions at bed level
    if (bed.genderRestriction && bed.genderRestriction !== "None") {
      if (bed.genderRestriction !== patient.sex) {
        return {
          isValid: false,
          severity: "HardStop",
          code: "BED_GENDER_MISMATCH",
          message: `Cannot assign ${patient.sex} patient to ${bed.genderRestriction}-only bed.`,
          details: {
            bedName: bed.name,
            bedGenderRestriction: bed.genderRestriction,
            patientSex: patient.sex,
            patientName: `${patient.firstName} ${patient.lastName}`,
          },
        };
      }
    }

    // Check gender restrictions at room level
    if (room.genderRestriction && room.genderRestriction !== "None") {
      if (room.genderRestriction !== patient.sex) {
        return {
          isValid: false,
          severity: "HardStop",
          code: "ROOM_GENDER_MISMATCH",
          message: `Cannot assign ${patient.sex} patient to ${room.genderRestriction}-only room.`,
          details: {
            roomName: room.name,
            roomGenderRestriction: room.genderRestriction,
            patientSex: patient.sex,
            patientName: `${patient.firstName} ${patient.lastName}`,
          },
        };
      }
    }

    return {
      isValid: true,
      severity: "None",
      code: "BED_ASSIGNMENT_VALID",
      message: "Bed assignment validation passed.",
      details: {
        bedName: bed.name,
        roomName: room.name,
        patientName: `${patient.firstName} ${patient.lastName}`,
      },
    };
  },
});

/**
 * Assign a patient to a bed
 */
export const assignPatientToBed = mutation({
  args: {
    bedId: v.id("beds"),
    patientId: v.id("patients"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate the assignment first
    const validation = await validateBedAssignment(ctx, {
      bedId: args.bedId,
      patientId: args.patientId,
    });

    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    const bed = await ctx.db.get(args.bedId);
    const patient = await ctx.db.get(args.patientId);

    if (!bed || !patient) {
      throw new Error("Bed or patient not found");
    }

    // Update bed status
    await ctx.db.patch(args.bedId, {
      status: "Occupied",
      data: {
        ...bed.data,
        occupiedBy: patient.eptId,
        occupiedAt: Date.now(),
      },
    });

    // Update patient record with bed assignment
    await ctx.db.patch(args.patientId, {
      data: {
        ...patient.data,
        currentBedId: bed.bedId,
        currentRoomId: bed.roomId,
      },
    });

    // Audit log
    await ctx.db.insert("auditLog", {
      userId: args.userId || "SYSTEM",
      action: "BED_ASSIGNMENT",
      recordType: "BED",
      recordId: bed.bedId,
      changes: {
        patientId: patient.eptId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        bedId: bed.bedId,
        bedName: bed.name,
      },
      timestamp: Date.now(),
    });

    return {
      success: true,
      bedId: bed.bedId,
      patientId: patient.eptId,
      message: `Patient ${patient.firstName} ${patient.lastName} assigned to bed ${bed.name}`,
    };
  },
});

/**
 * Release a patient from a bed
 */
export const releasePatientFromBed = mutation({
  args: {
    bedId: v.id("beds"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const bed = await ctx.db.get(args.bedId);

    if (!bed) {
      throw new Error("Bed not found");
    }

    const previousPatientId = bed.data.occupiedBy as string | undefined;

    // Update bed status
    await ctx.db.patch(args.bedId, {
      status: "Housekeeping",
      data: {
        ...bed.data,
        occupiedBy: null,
        releasedAt: Date.now(),
        previousPatient: previousPatientId,
      },
    });

    // Find and update patient record if exists
    if (previousPatientId) {
      const patient = await ctx.db
        .query("patients")
        .withIndex("by_eptId", (q) => q.eq("eptId", previousPatientId))
        .first();

      if (patient) {
        await ctx.db.patch(patient._id, {
          data: {
            ...patient.data,
            currentBedId: null,
            currentRoomId: null,
            previousBedId: bed.bedId,
          },
        });
      }
    }

    // Audit log
    await ctx.db.insert("auditLog", {
      userId: args.userId || "SYSTEM",
      action: "BED_RELEASE",
      recordType: "BED",
      recordId: bed.bedId,
      changes: {
        previousPatientId,
        bedId: bed.bedId,
        bedName: bed.name,
      },
      timestamp: Date.now(),
    });

    return {
      success: true,
      bedId: bed.bedId,
      message: `Bed ${bed.name} released and marked for housekeeping`,
    };
  },
});

/**
 * Get available beds for a patient (considering gender restrictions)
 */
export const getAvailableBedsForPatient = query({
  args: {
    patientId: v.id("patients"),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);

    if (!patient) {
      return { error: "Patient not found", beds: [] };
    }

    // Get all available beds
    let bedsQuery = ctx.db
      .query("beds")
      .filter((q) => q.eq(q.field("status"), "Available"));

    const allBeds = await bedsQuery.collect();

    // Filter beds based on gender restrictions and department
    const availableBeds = [];

    for (const bed of allBeds) {
      const room = await ctx.db.get(bed.roomId);
      if (!room) continue;

      // Check department filter if provided
      if (args.departmentId && room.departmentId !== args.departmentId) {
        continue;
      }

      // Check bed gender restriction
      if (bed.genderRestriction && bed.genderRestriction !== "None") {
        if (bed.genderRestriction !== patient.sex) {
          continue;
        }
      }

      // Check room gender restriction
      if (room.genderRestriction && room.genderRestriction !== "None") {
        if (room.genderRestriction !== patient.sex) {
          continue;
        }
      }

      availableBeds.push({
        bed,
        room,
        isCompatible: true,
      });
    }

    return {
      patient: {
        id: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        sex: patient.sex,
      },
      availableBeds,
      totalAvailable: availableBeds.length,
    };
  },
});

/**
 * Get bed status for a room
 */
export const getRoomBedStatus = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);

    if (!room) {
      return { error: "Room not found" };
    }

    const beds = await ctx.db
      .query("beds")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const bedStatuses = await Promise.all(
      beds.map(async (bed) => {
        let patientInfo = null;
        
        if (bed.status === "Occupied" && bed.data.occupiedBy) {
          const patient = await ctx.db
            .query("patients")
            .withIndex("by_eptId", (q) => q.eq("eptId", bed.data.occupiedBy as string))
            .first();
          
          if (patient) {
            patientInfo = {
              eptId: patient.eptId,
              name: `${patient.firstName} ${patient.lastName}`,
              sex: patient.sex,
              mrn: patient.mrn,
            };
          }
        }

        return {
          bed,
          patient: patientInfo,
        };
      })
    );

    return {
      room,
      beds: bedStatuses,
      summary: {
        total: beds.length,
        available: beds.filter((b) => b.status === "Available").length,
        occupied: beds.filter((b) => b.status === "Occupied").length,
        housekeeping: beds.filter((b) => b.status === "Housekeeping").length,
      },
    };
  },
});

/**
 * Create the Bed Logic Fail scenario
 * Attempt to admit a Male patient to a Female-only room
 */
export const createBedLogicFailScenario = mutation({
  args: {
    roomId: v.id("rooms"),
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    const patient = await ctx.db.get(args.patientId);

    if (!room || !patient) {
      throw new Error("Room or patient not found");
    }

    // Set the room to Female-only
    await ctx.db.patch(args.roomId, {
      genderRestriction: "Female",
    });

    // Ensure patient is Male
    await ctx.db.patch(args.patientId, {
      sex: "Male",
    });

    return {
      scenarioCreated: true,
      type: "BedLogicFail",
      message: `Attempting to assign Male patient to Female-only room will fail`,
      room: {
        id: room.romId,
        name: room.name,
        genderRestriction: "Female",
      },
      patient: {
        id: patient.eptId,
        name: `${patient.firstName} ${patient.lastName}`,
        sex: "Male",
      },
    };
  },
});
