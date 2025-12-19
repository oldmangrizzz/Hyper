// Chronicles Data Kernel Schema for Epic Simulator
// Implements INI > Record > Contact > Item > Value hierarchy

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Master Files (INIs) - Core Records
  records: defineTable({
    ini: v.string(), // INI identifier (e.g., "EPT", "EAR", "DEP", "BED", "ROM")
    recordId: v.string(), // The .1 Item ID (unique identifier)
    name: v.string(), // The .2 Item (Record Name)
    volatility: v.union(v.literal("STATIC"), v.literal("DYNAMIC")),
    parentId: v.optional(v.id("records")), // For Facility Structure hierarchy
    isTemplate: v.optional(v.boolean()), // For "Golden Records"
    data: v.object({}), // Flexible object for Item storage (keyed by Item Number)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ini_record", ["ini", "recordId"])
    .index("by_ini", ["ini"])
    .index("by_volatility", ["volatility"])
    .index("by_parent", ["parentId"]),

  // Security Classes (SEC 900 / ECL)
  securityClasses: defineTable({
    classId: v.string(), // Security Class ID
    name: v.string(), // Security Class Name
    permissions: v.array(v.string()), // Array of permission strings
    description: v.optional(v.string()),
  }).index("by_classId", ["classId"]),

  // User Records (EMP)
  users: defineTable({
    empId: v.string(), // Employee/User ID
    username: v.string(),
    name: v.string(),
    securityClasses: v.array(v.id("securityClasses")), // Linked security classes
    department: v.optional(v.id("records")), // Link to DEP record
    isActive: v.boolean(),
    data: v.object({}), // Additional user attributes
  })
    .index("by_empId", ["empId"])
    .index("by_username", ["username"]),

  // Patient Records (EPT)
  patients: defineTable({
    eptId: v.string(), // Patient ID
    mrn: v.string(), // Medical Record Number
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    sex: v.string(),
    guarantorId: v.optional(v.string()), // Link to EAR record
    volatility: v.literal("DYNAMIC"),
    isTemplate: v.optional(v.boolean()),
    data: v.object({}), // Additional patient data items
  })
    .index("by_eptId", ["eptId"])
    .index("by_mrn", ["mrn"])
    .index("by_guarantor", ["guarantorId"]),

  // Guarantor Records (EAR)
  guarantors: defineTable({
    earId: v.string(), // Guarantor ID
    name: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    volatility: v.literal("DYNAMIC"),
    data: v.object({}), // Additional guarantor data
  }).index("by_earId", ["earId"]),

  // Hospital Accounts (HSP)
  hospitalAccounts: defineTable({
    hspId: v.string(), // Hospital Account ID
    patientId: v.id("patients"), // Link to EPT
    accountType: v.string(),
    admitDate: v.optional(v.string()),
    dischargeDate: v.optional(v.string()),
    volatility: v.literal("DYNAMIC"),
    data: v.object({}), // Additional account data
  })
    .index("by_hspId", ["hspId"])
    .index("by_patient", ["patientId"]),

  // Departments (DEP)
  departments: defineTable({
    depId: v.string(), // Department ID
    name: v.string(),
    facilityId: v.optional(v.id("records")), // Link to parent EAF
    volatility: v.literal("STATIC"),
    settings: v.object({}), // Department-specific settings
    data: v.object({}), // Additional department data
  }).index("by_depId", ["depId"]),

  // Beds (BED)
  beds: defineTable({
    bedId: v.string(), // Bed ID
    roomId: v.id("rooms"), // Link to ROM
    name: v.string(),
    status: v.string(), // Available, Occupied, Housekeeping, etc.
    genderRestriction: v.optional(v.string()), // Male, Female, None
    volatility: v.literal("STATIC"),
    data: v.object({}), // Additional bed data
  })
    .index("by_bedId", ["bedId"])
    .index("by_room", ["roomId"]),

  // Rooms (ROM)
  rooms: defineTable({
    romId: v.string(), // Room ID
    name: v.string(),
    departmentId: v.optional(v.id("departments")), // Link to DEP
    genderRestriction: v.optional(v.string()), // Male, Female, None
    privacyLevel: v.optional(v.string()), // Private, Semi-Private, Ward
    volatility: v.literal("STATIC"),
    data: v.object({}), // Additional room data
  })
    .index("by_romId", ["romId"])
    .index("by_department", ["departmentId"]),

  // Facilities (EAF)
  facilities: defineTable({
    eafId: v.string(), // Facility/Service Area ID
    name: v.string(),
    parentId: v.optional(v.id("facilities")), // For hierarchy
    type: v.string(), // Facility, ServiceArea, RevenueLocation
    volatility: v.literal("STATIC"),
    settings: v.object({}), // Facility-specific settings that bubble down
    data: v.object({}), // Additional facility data
  })
    .index("by_eafId", ["eafId"])
    .index("by_parent", ["parentId"]),

  // Workflow Engine Rules (LOR)
  workflowRules: defineTable({
    lorId: v.string(), // Rule ID
    name: v.string(),
    description: v.optional(v.string()),
    conditions: v.array(v.object({})), // Rule conditions
    actions: v.array(v.object({})), // Rule actions
    isActive: v.boolean(),
    volatility: v.literal("STATIC"),
  }).index("by_lorId", ["lorId"]),

  // Navigators (LVN)
  navigators: defineTable({
    lvnId: v.string(), // Navigator ID
    name: v.string(),
    description: v.optional(v.string()),
    steps: v.array(v.object({})), // Navigator steps/forms
    volatility: v.literal("STATIC"),
  }).index("by_lvnId", ["lvnId"]),

  // Validation Errors/Warnings
  validations: defineTable({
    recordType: v.string(), // Type of record being validated
    recordId: v.string(), // ID of the record
    severity: v.string(), // HardStop, SoftStop, Warning
    message: v.string(),
    code: v.string(), // Error code
    timestamp: v.number(),
  })
    .index("by_record", ["recordType", "recordId"])
    .index("by_timestamp", ["timestamp"]),

  // Training Scenarios
  scenarios: defineTable({
    scenarioId: v.string(),
    name: v.string(),
    description: v.string(),
    type: v.string(), // InheritanceFail, FilingOrderFail, BedLogicFail, etc.
    setupData: v.object({}), // Data needed to set up the scenario
    expectedOutcome: v.string(),
    isActive: v.boolean(),
  }).index("by_scenarioId", ["scenarioId"]),

  // System Configuration (LSD)
  systemConfig: defineTable({
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    category: v.string(), // General, Security, Validation, etc.
  }).index("by_key", ["key"]),

  // Audit Log
  auditLog: defineTable({
    userId: v.optional(v.string()),
    action: v.string(),
    recordType: v.string(),
    recordId: v.string(),
    changes: v.object({}),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_record", ["recordType", "recordId"]),
});
