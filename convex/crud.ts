// CRUD Operations for Core Entities
// Patients, Guarantors, Departments, Rooms, Beds, Facilities

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// PATIENTS (EPT)
// ============================================================================

export const createPatient = mutation({
  args: {
    eptId: v.string(),
    mrn: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    sex: v.string(),
    guarantorId: v.optional(v.string()),
    isTemplate: v.optional(v.boolean()),
    data: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const { data, ...patientData } = args;
    
    const patientId = await ctx.db.insert("patients", {
      ...patientData,
      volatility: "DYNAMIC",
      data: data || {},
    });

    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "PATIENT_CREATED",
      recordType: "EPT",
      recordId: args.eptId,
      changes: patientData,
      timestamp: Date.now(),
    });

    return patientId;
  },
});

export const getPatient = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.patientId);
  },
});

export const getPatientByEptId = query({
  args: {
    eptId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patients")
      .withIndex("by_eptId", (q) => q.eq("eptId", args.eptId))
      .first();
  },
});

export const getPatientByMrn = query({
  args: {
    mrn: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patients")
      .withIndex("by_mrn", (q) => q.eq("mrn", args.mrn))
      .first();
  },
});

export const listPatients = query({
  args: {
    limit: v.optional(v.number()),
    includeTemplates: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("patients");
    
    if (!args.includeTemplates) {
      query = query.filter((q) => q.neq(q.field("isTemplate"), true));
    }

    return await query.take(args.limit || 50);
  },
});

export const updatePatient = mutation({
  args: {
    patientId: v.id("patients"),
    updates: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      dateOfBirth: v.optional(v.string()),
      sex: v.optional(v.string()),
      guarantorId: v.optional(v.string()),
      data: v.optional(v.object({})),
    }),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    
    if (!patient) {
      throw new Error("Patient not found");
    }

    await ctx.db.patch(args.patientId, args.updates);

    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "PATIENT_UPDATED",
      recordType: "EPT",
      recordId: patient.eptId,
      changes: args.updates,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const deletePatient = mutation({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    
    if (!patient) {
      throw new Error("Patient not found");
    }

    await ctx.db.delete(args.patientId);

    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "PATIENT_DELETED",
      recordType: "EPT",
      recordId: patient.eptId,
      changes: {},
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// ============================================================================
// GUARANTORS (EAR)
// ============================================================================

export const createGuarantor = mutation({
  args: {
    earId: v.string(),
    name: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    data: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const { data, ...guarantorData } = args;
    
    const guarantorId = await ctx.db.insert("guarantors", {
      ...guarantorData,
      volatility: "DYNAMIC",
      data: data || {},
    });

    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "GUARANTOR_CREATED",
      recordType: "EAR",
      recordId: args.earId,
      changes: guarantorData,
      timestamp: Date.now(),
    });

    return guarantorId;
  },
});

export const getGuarantor = query({
  args: {
    guarantorId: v.id("guarantors"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.guarantorId);
  },
});

export const getGuarantorByEarId = query({
  args: {
    earId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("guarantors")
      .withIndex("by_earId", (q) => q.eq("earId", args.earId))
      .first();
  },
});

export const listGuarantors = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("guarantors").take(args.limit || 50);
  },
});

// ============================================================================
// DEPARTMENTS (DEP)
// ============================================================================

export const createDepartment = mutation({
  args: {
    depId: v.string(),
    name: v.string(),
    facilityId: v.optional(v.id("records")),
    settings: v.optional(v.object({})),
    data: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const { settings, data, ...deptData } = args;
    
    const deptId = await ctx.db.insert("departments", {
      ...deptData,
      volatility: "STATIC",
      settings: settings || {},
      data: data || {},
    });

    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "DEPARTMENT_CREATED",
      recordType: "DEP",
      recordId: args.depId,
      changes: deptData,
      timestamp: Date.now(),
    });

    return deptId;
  },
});

export const getDepartment = query({
  args: {
    departmentId: v.id("departments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.departmentId);
  },
});

export const getDepartmentByDepId = query({
  args: {
    depId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("departments")
      .withIndex("by_depId", (q) => q.eq("depId", args.depId))
      .first();
  },
});

export const listDepartments = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("departments").take(args.limit || 100);
  },
});

// ============================================================================
// ROOMS (ROM)
// ============================================================================

export const createRoom = mutation({
  args: {
    romId: v.string(),
    name: v.string(),
    departmentId: v.optional(v.id("departments")),
    genderRestriction: v.optional(v.string()),
    privacyLevel: v.optional(v.string()),
    data: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const { data, ...roomData } = args;
    
    const roomId = await ctx.db.insert("rooms", {
      ...roomData,
      volatility: "STATIC",
      data: data || {},
    });

    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "ROOM_CREATED",
      recordType: "ROM",
      recordId: args.romId,
      changes: roomData,
      timestamp: Date.now(),
    });

    return roomId;
  },
});

export const getRoom = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.roomId);
  },
});

export const getRoomByRomId = query({
  args: {
    romId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_romId", (q) => q.eq("romId", args.romId))
      .first();
  },
});

export const listRooms = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("rooms");
    
    if (args.departmentId) {
      query = query.withIndex("by_department", (q) => 
        q.eq("departmentId", args.departmentId)
      );
    }

    return await query.take(args.limit || 100);
  },
});

// ============================================================================
// BEDS (BED)
// ============================================================================

export const createBed = mutation({
  args: {
    bedId: v.string(),
    roomId: v.id("rooms"),
    name: v.string(),
    status: v.optional(v.string()),
    genderRestriction: v.optional(v.string()),
    data: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const { data, ...bedData } = args;
    
    const bedIdValue = await ctx.db.insert("beds", {
      ...bedData,
      status: args.status || "Available",
      volatility: "STATIC",
      data: data || {},
    });

    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "BED_CREATED",
      recordType: "BED",
      recordId: args.bedId,
      changes: bedData,
      timestamp: Date.now(),
    });

    return bedIdValue;
  },
});

export const getBed = query({
  args: {
    bedId: v.id("beds"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bedId);
  },
});

export const getBedByBedId = query({
  args: {
    bedId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("beds")
      .withIndex("by_bedId", (q) => q.eq("bedId", args.bedId))
      .first();
  },
});

export const listBeds = query({
  args: {
    roomId: v.optional(v.id("rooms")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("beds");
    
    if (args.roomId) {
      query = query.withIndex("by_room", (q) => q.eq("roomId", args.roomId));
    }

    let beds = await query.take(args.limit || 100);

    if (args.status) {
      beds = beds.filter((b) => b.status === args.status);
    }

    return beds;
  },
});

// ============================================================================
// FACILITIES (EAF)
// ============================================================================

export const createFacility = mutation({
  args: {
    eafId: v.string(),
    name: v.string(),
    parentId: v.optional(v.id("facilities")),
    type: v.string(),
    settings: v.optional(v.object({})),
    data: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const { settings, data, ...facilityData } = args;
    
    const facilityId = await ctx.db.insert("facilities", {
      ...facilityData,
      volatility: "STATIC",
      settings: settings || {},
      data: data || {},
    });

    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "FACILITY_CREATED",
      recordType: "EAF",
      recordId: args.eafId,
      changes: facilityData,
      timestamp: Date.now(),
    });

    return facilityId;
  },
});

export const getFacility = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.facilityId);
  },
});

export const getFacilityByEafId = query({
  args: {
    eafId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("facilities")
      .withIndex("by_eafId", (q) => q.eq("eafId", args.eafId))
      .first();
  },
});

export const listFacilities = query({
  args: {
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let facilities = await ctx.db.query("facilities").take(args.limit || 100);

    if (args.type) {
      facilities = facilities.filter((f) => f.type === args.type);
    }

    return facilities;
  },
});
