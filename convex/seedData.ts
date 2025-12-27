// Data Initialization and Seeding
// Creates initial static records for departments, rooms, beds, facilities, security classes

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Initialize all required static data for the simulator
 * This should be run once during initial setup
 */
export const initializeSystem = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      facilities: 0,
      departments: 0,
      rooms: 0,
      beds: 0,
      securityClasses: 0,
      systemConfig: 0,
      scenarios: 0,
    };

    // Check if already initialized
    const existingFacilities = await ctx.db.query("facilities").first();
    if (existingFacilities) {
      return {
        message: "System already initialized",
        skipped: true,
      };
    }

    // ========================================================================
    // 1. CREATE FACILITY STRUCTURE (EAF)
    // ========================================================================

    // System-level facility
    const facilityId = await ctx.db.insert("facilities", {
      eafId: "FAC-NORTH",
      name: "Health System North",
      type: "Facility",
      volatility: "STATIC",
      settings: {
        visitationHours: "24/7",
        defaultPrinter: "FAC-DEFAULT",
        badgeAccess: "System Staff",
      },
      data: {},
    });
    results.facilities++;

    // Service Area
    const serviceAreaId = await ctx.db.insert("facilities", {
      eafId: "SA-CHILDREN",
      name: "Cook Children's",
      parentId: facilityId,
      type: "ServiceArea",
      volatility: "STATIC",
      settings: {
        visitationHours: "8a - 8p",
        defaultPrinter: "SA-DEFAULT-01",
        badgeAccess: "Service Area Staff",
      },
      data: {},
    });
    results.facilities++;

    // Revenue Location
    const revenueLocationId = await ctx.db.insert("facilities", {
      eafId: "RL-MAIN-PAV",
      name: "Main Campus Pavilion",
      parentId: serviceAreaId,
      type: "RevenueLocation",
      volatility: "STATIC",
      settings: {
        visitationHours: "9a - 9p",
        defaultPrinter: "PAV-CH-01",
        badgeAccess: "Campus Staff",
      },
      data: {},
    });
    results.facilities++;

    // ========================================================================
    // 2. CREATE DEPARTMENTS (DEP)
    // ========================================================================

    const dept3WestPed = await ctx.db.insert("departments", {
      depId: "DEP-3W-PED",
      name: "3 West Pediatrics",
      facilityId: revenueLocationId,
      volatility: "STATIC",
      settings: {
        visitationHours: "10a - 8p",
        badgeAccess: "Peds Nurse",
      },
      data: {
        description: "Pediatric general care unit",
      },
    });
    results.departments++;

    const deptICU = await ctx.db.insert("departments", {
      depId: "DEP-ICU",
      name: "Intensive Care Unit",
      facilityId: revenueLocationId,
      volatility: "STATIC",
      settings: {
        visitationHours: "12p - 8p",
        badgeAccess: "ICU Staff",
      },
      data: {
        description: "Critical care unit",
      },
    });
    results.departments++;

    const deptED = await ctx.db.insert("departments", {
      depId: "DEP-ED",
      name: "Emergency Department",
      facilityId: revenueLocationId,
      volatility: "STATIC",
      settings: {
        visitationHours: "24/7",
        badgeAccess: "ED Staff",
      },
      data: {
        description: "Emergency services",
      },
    });
    results.departments++;

    // ========================================================================
    // 3. CREATE ROOMS (ROM)
    // ========================================================================

    const rom3001 = await ctx.db.insert("rooms", {
      romId: "ROM-3001",
      name: "3 West - Room 301 (Pediatrics A)",
      departmentId: dept3WestPed,
      genderRestriction: "Female",
      privacyLevel: "Semi-Private",
      volatility: "STATIC",
      data: {
        description: "Female-only pediatric room",
      },
    });
    results.rooms++;

    const rom3002 = await ctx.db.insert("rooms", {
      romId: "ROM-3002",
      name: "3 West - Room 302 (Pediatrics B)",
      departmentId: dept3WestPed,
      genderRestriction: "None",
      privacyLevel: "Semi-Private",
      volatility: "STATIC",
      data: {
        description: "Mixed gender pediatric room",
      },
    });
    results.rooms++;

    const rom3003 = await ctx.db.insert("rooms", {
      romId: "ROM-3003",
      name: "3 West - Room 303 (Pediatrics C)",
      departmentId: dept3WestPed,
      genderRestriction: "Male",
      privacyLevel: "Private",
      volatility: "STATIC",
      data: {
        description: "Male-only private pediatric room",
      },
    });
    results.rooms++;

    const romICU101 = await ctx.db.insert("rooms", {
      romId: "ROM-ICU-101",
      name: "ICU Room 101",
      departmentId: deptICU,
      genderRestriction: "None",
      privacyLevel: "Private",
      volatility: "STATIC",
      data: {
        description: "ICU private room",
      },
    });
    results.rooms++;

    // ========================================================================
    // 4. CREATE BEDS (BED)
    // ========================================================================

    // Room 301 beds (Female-only)
    await ctx.db.insert("beds", {
      bedId: "BED-3001A",
      roomId: rom3001,
      name: "Bed A",
      status: "Available",
      genderRestriction: "Female",
      volatility: "STATIC",
      data: {},
    });
    results.beds++;

    await ctx.db.insert("beds", {
      bedId: "BED-3001B",
      roomId: rom3001,
      name: "Bed B",
      status: "Occupied",
      genderRestriction: "Female",
      volatility: "STATIC",
      data: { occupiedBy: "TEMPLATE_CHILD_001" },
    });
    results.beds++;

    // Room 302 beds (Mixed)
    await ctx.db.insert("beds", {
      bedId: "BED-3002A",
      roomId: rom3002,
      name: "Bed A",
      status: "Available",
      genderRestriction: "None",
      volatility: "STATIC",
      data: {},
    });
    results.beds++;

    await ctx.db.insert("beds", {
      bedId: "BED-3002B",
      roomId: rom3002,
      name: "Bed B",
      status: "Housekeeping",
      genderRestriction: "None",
      volatility: "STATIC",
      data: {},
    });
    results.beds++;

    // Room 303 beds (Male-only)
    await ctx.db.insert("beds", {
      bedId: "BED-3003A",
      roomId: rom3003,
      name: "Bed A",
      status: "Available",
      genderRestriction: "Male",
      volatility: "STATIC",
      data: {},
    });
    results.beds++;

    // ICU beds
    await ctx.db.insert("beds", {
      bedId: "BED-ICU-101A",
      roomId: romICU101,
      name: "Bed A",
      status: "Available",
      genderRestriction: "None",
      volatility: "STATIC",
      data: {},
    });
    results.beds++;

    // ========================================================================
    // 5. CREATE SECURITY CLASSES (ECL / SEC 900)
    // ========================================================================

    await ctx.db.insert("securityClasses", {
      classId: "SEC-BED-PLANNER",
      name: "Bed Planner",
      description: "Command center assignment privileges",
      permissions: ["BED_ASSIGN", "BED_PLANNER", "VIEW_CENSUS", "VIEW_PATIENTS"],
    });
    results.securityClasses++;

    await ctx.db.insert("securityClasses", {
      classId: "SEC-REGISTRAR",
      name: "Registrar",
      description: "Registration and coverage capture",
      permissions: ["REGISTRATION", "VERIFY_COVERAGE", "CREATE_PATIENT", "CREATE_GUARANTOR"],
    });
    results.securityClasses++;

    await ctx.db.insert("securityClasses", {
      classId: "SEC-UNIT-NURSE",
      name: "Unit Nurse",
      description: "Unit-level patient management",
      permissions: ["REGISTRATION", "VIEW_CENSUS", "VIEW_PATIENTS"],
    });
    results.securityClasses++;

    await ctx.db.insert("securityClasses", {
      classId: "SEC-ADMIN",
      name: "System Administrator",
      description: "Full system access",
      permissions: ["*"],
    });
    results.securityClasses++;

    // ========================================================================
    // 6. CREATE SYSTEM CONFIGURATION (LSD)
    // ========================================================================

    const systemConfigs = [
      {
        key: "visitationHours",
        value: "24/7",
        description: "Default visitation hours",
        category: "General",
      },
      {
        key: "defaultPrinter",
        value: "SYS-FALLBACK",
        description: "System fallback printer",
        category: "General",
      },
      {
        key: "badgeAccess",
        value: "Any",
        description: "Default badge access requirement",
        category: "Security",
      },
      {
        key: "pediatricAgeThreshold",
        value: 18,
        description: "Age threshold for pediatric constraints",
        category: "Validation",
      },
      {
        key: "mitosisSchedule",
        value: "0 0 * * *",
        description: "Cron schedule for mitosis reset (daily at midnight)",
        category: "System",
      },
    ];

    for (const config of systemConfigs) {
      await ctx.db.insert("systemConfig", config);
      results.systemConfig++;
    }

    // ========================================================================
    // 7. CREATE TRAINING SCENARIOS
    // ========================================================================

    const scenarios = [
      {
        scenarioId: "SCENARIO-INHERITANCE-FAIL",
        name: "Inheritance Fail",
        description: "Department overrides Service Area visitation hours with a blank value",
        type: "InheritanceFail",
        setupData: {
          settingKey: "visitationHours",
          facilityLevel: "ServiceArea",
          departmentLevel: "Department",
          expectedIssue: "Navigator shows empty rule set",
        },
        expectedOutcome: "Setting resolution fails, shows null instead of parent value",
        isActive: true,
      },
      {
        scenarioId: "SCENARIO-FILING-ORDER-FAIL",
        name: "Filing Order Fail",
        description: "Medicaid listed before Primary in VFO calculator",
        type: "FilingOrderFail",
        setupData: {
          issue: "Payer of Last Resort violation",
        },
        expectedOutcome: "Instant claim denial",
        isActive: true,
      },
      {
        scenarioId: "SCENARIO-BED-LOGIC-FAIL",
        name: "Bed Logic Fail",
        description: "Male patient placed into Female-only room (ROM)",
        type: "BedLogicFail",
        setupData: {
          patientSex: "Male",
          roomGenderRestriction: "Female",
        },
        expectedOutcome: "Hard stop should trigger, prevents assignment",
        isActive: true,
      },
      {
        scenarioId: "SCENARIO-RTE-MAPPING-FAIL",
        name: "RTE Mapping Fail",
        description: "Unmapped 271 EB code sits in Raw Data",
        type: "RTEMappingFail",
        setupData: {
          issue: "271 eligibility response code not mapped to CMG",
        },
        expectedOutcome: "No POS collection prompt, data stuck in raw format",
        isActive: true,
      },
      {
        scenarioId: "SCENARIO-THREE-DAY-WINDOW-FAIL",
        name: "Three-Day Window Fail",
        description: "ED visit not bundled into Inpatient HAR",
        type: "ThreeDayWindowFail",
        setupData: {
          issue: "HOV to Inpatient bundling failure",
        },
        expectedOutcome: "Billing compliance risk, duplicate charges",
        isActive: true,
      },
    ];

    for (const scenario of scenarios) {
      await ctx.db.insert("scenarios", scenario);
      results.scenarios++;
    }

    // ========================================================================
    // 8. AUDIT LOG
    // ========================================================================

    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "SYSTEM_INITIALIZED",
      recordType: "SYSTEM",
      recordId: "INIT",
      changes: results,
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: "System initialized successfully",
      results,
    };
  },
});

/**
 * Reset system to initial state (WARNING: Deletes all data)
 */
export const resetSystem = mutation({
  args: {
    confirmationCode: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.confirmationCode !== "RESET_ALL_DATA") {
      throw new Error("Invalid confirmation code");
    }

    // Delete all dynamic data
    const patients = await ctx.db.query("patients").collect();
    for (const patient of patients) {
      await ctx.db.delete(patient._id);
    }

    const guarantors = await ctx.db.query("guarantors").collect();
    for (const guarantor of guarantors) {
      await ctx.db.delete(guarantor._id);
    }

    const hospitalAccounts = await ctx.db.query("hospitalAccounts").collect();
    for (const account of hospitalAccounts) {
      await ctx.db.delete(account._id);
    }

    // Delete all static data
    const facilities = await ctx.db.query("facilities").collect();
    for (const facility of facilities) {
      await ctx.db.delete(facility._id);
    }

    const departments = await ctx.db.query("departments").collect();
    for (const dept of departments) {
      await ctx.db.delete(dept._id);
    }

    const rooms = await ctx.db.query("rooms").collect();
    for (const room of rooms) {
      await ctx.db.delete(room._id);
    }

    const beds = await ctx.db.query("beds").collect();
    for (const bed of beds) {
      await ctx.db.delete(bed._id);
    }

    const securityClasses = await ctx.db.query("securityClasses").collect();
    for (const sc of securityClasses) {
      await ctx.db.delete(sc._id);
    }

    const systemConfig = await ctx.db.query("systemConfig").collect();
    for (const config of systemConfig) {
      await ctx.db.delete(config._id);
    }

    const scenarios = await ctx.db.query("scenarios").collect();
    for (const scenario of scenarios) {
      await ctx.db.delete(scenario._id);
    }

    return {
      success: true,
      message: "System reset complete. Run initializeSystem to reinitialize.",
    };
  },
});

/**
 * Get system initialization status
 */
export const getSystemStatus = query({
  args: {},
  handler: async (ctx) => {
    const facilitiesCount = (await ctx.db.query("facilities").collect()).length;
    const departmentsCount = (await ctx.db.query("departments").collect()).length;
    const roomsCount = (await ctx.db.query("rooms").collect()).length;
    const bedsCount = (await ctx.db.query("beds").collect()).length;
    const securityClassesCount = (await ctx.db.query("securityClasses").collect()).length;
    const patientsCount = (await ctx.db.query("patients").collect()).length;
    const guarantorsCount = (await ctx.db.query("guarantors").collect()).length;

    const isInitialized = facilitiesCount > 0 && departmentsCount > 0;

    return {
      isInitialized,
      counts: {
        facilities: facilitiesCount,
        departments: departmentsCount,
        rooms: roomsCount,
        beds: bedsCount,
        securityClasses: securityClassesCount,
        patients: patientsCount,
        guarantors: guarantorsCount,
      },
    };
  },
});
