// Facility Structure and Rule of Specificity
// Implements recursive "Bubble-Up" lookup for settings inheritance

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Get a setting value with bubble-up logic
 * Checks Department -> Revenue Location -> Service Area -> Facility -> System Default
 */
export const getSettingWithInheritance = query({
  args: {
    departmentId: v.id("departments"),
    settingKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Check Department level
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      return {
        value: null,
        source: "NOT_FOUND",
        error: "Department not found",
      };
    }

    if (department.settings[args.settingKey] !== undefined && department.settings[args.settingKey] !== null) {
      return {
        value: department.settings[args.settingKey],
        source: "DEPARTMENT",
        departmentId: department._id,
        departmentName: department.name,
      };
    }

    // Step 2: Check Facility hierarchy (EAF) if linked
    if (department.facilityId) {
      const facilityValue = await bubbleUpFacility(ctx, department.facilityId, args.settingKey);
      if (facilityValue.value !== null) {
        return facilityValue;
      }
    }

    // Step 3: Check System Configuration (LSD)
    const systemConfig = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.settingKey))
      .first();

    if (systemConfig) {
      return {
        value: systemConfig.value,
        source: "SYSTEM_DEFAULT",
        description: systemConfig.description,
      };
    }

    // Step 4: No value found
    return {
      value: null,
      source: "NOT_CONFIGURED",
      error: `Setting '${args.settingKey}' not found in hierarchy`,
    };
  },
});

/**
 * Recursive bubble-up through facility hierarchy
 */
async function bubbleUpFacility(ctx: any, facilityId: Id<"facilities">, settingKey: string): Promise<any> {
  const facility = await ctx.db.get(facilityId);
  
  if (!facility) {
    return { value: null, source: "NOT_FOUND" };
  }

  // Check if this facility has the setting
  if (facility.settings[settingKey] !== undefined && facility.settings[settingKey] !== null) {
    return {
      value: facility.settings[settingKey],
      source: `FACILITY_${facility.type.toUpperCase()}`,
      facilityId: facility._id,
      facilityName: facility.name,
      facilityType: facility.type,
    };
  }

  // Recursively check parent facility
  if (facility.parentId) {
    return await bubbleUpFacility(ctx, facility.parentId, settingKey);
  }

  return { value: null, source: "NOT_FOUND" };
}

/**
 * Get all settings for a department with their sources
 */
export const getDepartmentSettings = query({
  args: {
    departmentId: v.id("departments"),
  },
  handler: async (ctx, args) => {
    const department = await ctx.db.get(args.departmentId);
    
    if (!department) {
      return { error: "Department not found" };
    }

    // Get all possible setting keys from system config
    const systemSettings = await ctx.db.query("systemConfig").collect();
    const allSettingKeys = [
      ...Object.keys(department.settings),
      ...systemSettings.map(s => s.key),
    ];
    
    // Remove duplicates
    const uniqueKeys = Array.from(new Set(allSettingKeys));

    const settings: Record<string, any> = {};
    
    for (const key of uniqueKeys) {
      const result = await getSettingWithInheritance(ctx, {
        departmentId: args.departmentId,
        settingKey: key,
      });
      settings[key] = result;
    }

    return {
      department: {
        id: department._id,
        name: department.name,
        depId: department.depId,
      },
      settings,
    };
  },
});

/**
 * Set a setting at the department level
 */
export const setDepartmentSetting = mutation({
  args: {
    departmentId: v.id("departments"),
    settingKey: v.string(),
    settingValue: v.any(),
  },
  handler: async (ctx, args) => {
    const department = await ctx.db.get(args.departmentId);
    
    if (!department) {
      throw new Error("Department not found");
    }

    const newSettings = {
      ...department.settings,
      [args.settingKey]: args.settingValue,
    };

    await ctx.db.patch(args.departmentId, {
      settings: newSettings,
    });

    // Audit log
    await ctx.db.insert("auditLog", {
      userId: "SYSTEM", // Should be passed from auth context
      action: "SETTING_UPDATE",
      recordType: "DEP",
      recordId: department.depId,
      changes: {
        settingKey: args.settingKey,
        oldValue: department.settings[args.settingKey],
        newValue: args.settingValue,
      },
      timestamp: Date.now(),
    });

    return {
      success: true,
      departmentId: args.departmentId,
      settingKey: args.settingKey,
      settingValue: args.settingValue,
    };
  },
});

/**
 * Set a setting at the facility level
 */
export const setFacilitySetting = mutation({
  args: {
    facilityId: v.id("facilities"),
    settingKey: v.string(),
    settingValue: v.any(),
  },
  handler: async (ctx, args) => {
    const facility = await ctx.db.get(args.facilityId);
    
    if (!facility) {
      throw new Error("Facility not found");
    }

    const newSettings = {
      ...facility.settings,
      [args.settingKey]: args.settingValue,
    };

    await ctx.db.patch(args.facilityId, {
      settings: newSettings,
    });

    // Audit log
    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "SETTING_UPDATE",
      recordType: "EAF",
      recordId: facility.eafId,
      changes: {
        settingKey: args.settingKey,
        oldValue: facility.settings[args.settingKey],
        newValue: args.settingValue,
      },
      timestamp: Date.now(),
    });

    return {
      success: true,
      facilityId: args.facilityId,
      settingKey: args.settingKey,
      settingValue: args.settingValue,
    };
  },
});

/**
 * Get the complete facility hierarchy for a department
 */
export const getFacilityHierarchy = query({
  args: {
    departmentId: v.id("departments"),
  },
  handler: async (ctx, args) => {
    const department = await ctx.db.get(args.departmentId);
    
    if (!department) {
      return { error: "Department not found" };
    }

    const hierarchy: any[] = [
      {
        level: "Department",
        id: department._id,
        name: department.name,
        identifier: department.depId,
        settings: department.settings,
      },
    ];

    if (department.facilityId) {
      let currentFacilityId: Id<"facilities"> | undefined = department.facilityId;
      let level = 1;

      while (currentFacilityId) {
        const facility = await ctx.db.get(currentFacilityId);
        if (!facility) break;

        hierarchy.push({
          level: facility.type,
          id: facility._id,
          name: facility.name,
          identifier: facility.eafId,
          settings: facility.settings,
          parentId: facility.parentId,
        });

        currentFacilityId = facility.parentId;
        level++;
      }
    }

    // Add system defaults
    const systemConfigs = await ctx.db.query("systemConfig").collect();
    hierarchy.push({
      level: "System Defaults",
      settings: systemConfigs.reduce((acc, config) => {
        acc[config.key] = config.value;
        return acc;
      }, {} as Record<string, any>),
    });

    return hierarchy;
  },
});

/**
 * Test the inheritance fail scenario
 * A setting at Service Area is overridden by blank/contradictory at Department
 */
export const createInheritanceFailScenario = mutation({
  args: {
    facilityId: v.id("facilities"),
    departmentId: v.id("departments"),
    settingKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Set a valid value at facility level
    await setFacilitySetting(ctx, {
      facilityId: args.facilityId,
      settingKey: args.settingKey,
      settingValue: "EXPECTED_VALUE",
    });

    // Override with null at department level (creates the fail state)
    await setDepartmentSetting(ctx, {
      departmentId: args.departmentId,
      settingKey: args.settingKey,
      settingValue: null,
    });

    return {
      scenarioCreated: true,
      type: "InheritanceFail",
      message: `Setting '${args.settingKey}' will return null instead of facility value`,
    };
  },
});

/**
 * Validate that inheritance is working correctly
 */
export const validateInheritance = query({
  args: {
    departmentId: v.id("departments"),
    expectedSettings: v.array(v.object({
      key: v.string(),
      expectedSource: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const expected of args.expectedSettings) {
      const actual = await getSettingWithInheritance(ctx, {
        departmentId: args.departmentId,
        settingKey: expected.key,
      });

      const isValid = actual.source === expected.expectedSource;

      results.push({
        settingKey: expected.key,
        expectedSource: expected.expectedSource,
        actualSource: actual.source,
        actualValue: actual.value,
        isValid,
      });
    }

    const allValid = results.every(r => r.isValid);

    return {
      isValid: allValid,
      results,
      summary: {
        total: results.length,
        valid: results.filter(r => r.isValid).length,
        invalid: results.filter(r => !r.isValid).length,
      },
    };
  },
});
