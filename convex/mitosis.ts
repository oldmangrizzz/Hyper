// Mitosis Reset Engine
// Nightly mitigation script to prevent environment rot

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Run the Mitosis reset process
 * 1. Identify all DYNAMIC records
 * 2. Purge non-template Dynamic records
 * 3. Date slide template records
 */
export const runMitosis = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      patientsDeleted: 0,
      guarantorsDeleted: 0,
      hospitalAccountsDeleted: 0,
      templatesUpdated: 0,
      timestamp: Date.now(),
    };

    // Step 1 & 2: Purge non-template DYNAMIC records
    
    // Delete non-template patients
    const patients = await ctx.db
      .query("patients")
      .filter((q) => q.neq(q.field("isTemplate"), true))
      .collect();
    
    for (const patient of patients) {
      await ctx.db.delete(patient._id);
      results.patientsDeleted++;
    }

    // Delete non-template guarantors
    const guarantors = await ctx.db
      .query("guarantors")
      .collect();
    
    for (const guarantor of guarantors) {
      // Check if this guarantor is linked to any template patients
      const linkedTemplates = await ctx.db
        .query("patients")
        .withIndex("by_guarantor", (q) => q.eq("guarantorId", guarantor.earId))
        .filter((q) => q.eq(q.field("isTemplate"), true))
        .first();
      
      if (!linkedTemplates) {
        await ctx.db.delete(guarantor._id);
        results.guarantorsDeleted++;
      }
    }

    // Delete all hospital accounts (always DYNAMIC)
    const hospitalAccounts = await ctx.db.query("hospitalAccounts").collect();
    for (const account of hospitalAccounts) {
      await ctx.db.delete(account._id);
      results.hospitalAccountsDeleted++;
    }

    // Delete all validations older than 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const oldValidations = await ctx.db
      .query("validations")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", oneDayAgo))
      .collect();
    
    for (const validation of oldValidations) {
      await ctx.db.delete(validation._id);
    }

    // Step 3: Date slide template records
    const today = new Date();
    const templatePatients = await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("isTemplate"), true))
      .collect();

    for (const template of templatePatients) {
      // Extract relative age from template data
      const relativeAge = template.data.relativeAge as number | undefined;
      
      if (relativeAge !== undefined) {
        // Calculate new date of birth based on relative age
        const newDob = new Date(today);
        if (relativeAge < 1) {
          // For infants, relativeAge might be in days (e.g., 0.008 for 3 days)
          const daysOld = Math.round(relativeAge * 365);
          newDob.setDate(newDob.getDate() - daysOld);
        } else {
          newDob.setFullYear(newDob.getFullYear() - Math.floor(relativeAge));
        }
        
        await ctx.db.patch(template._id, {
          dateOfBirth: newDob.toISOString().split('T')[0],
        });
        
        results.templatesUpdated++;
      }
    }

    // Log the mitosis run
    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "MITOSIS_RESET",
      recordType: "SYSTEM",
      recordId: "MITOSIS",
      changes: results,
      timestamp: Date.now(),
    });

    return results;
  },
});

/**
 * Get the last mitosis run information
 */
export const getLastMitosisRun = query({
  args: {},
  handler: async (ctx) => {
    const lastRun = await ctx.db
      .query("auditLog")
      .withIndex("by_record", (q) => 
        q.eq("recordType", "SYSTEM").eq("recordId", "MITOSIS")
      )
      .order("desc")
      .first();

    return lastRun;
  },
});

/**
 * Check if mitosis should run
 * Returns true if last run was more than 24 hours ago
 */
export const shouldRunMitosis = query({
  args: {},
  handler: async (ctx) => {
    const lastRun = await ctx.db
      .query("auditLog")
      .withIndex("by_record", (q) => 
        q.eq("recordType", "SYSTEM").eq("recordId", "MITOSIS")
      )
      .order("desc")
      .first();

    if (!lastRun) {
      return { shouldRun: true, reason: "No previous mitosis run found" };
    }

    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const shouldRun = lastRun.timestamp < twentyFourHoursAgo;

    return {
      shouldRun,
      reason: shouldRun 
        ? "Last run was more than 24 hours ago" 
        : "Mitosis ran recently",
      lastRun: new Date(lastRun.timestamp).toISOString(),
    };
  },
});

/**
 * Manual trigger for mitosis reset (admin only)
 */
export const triggerMitosisManually = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Log the manual trigger
    await ctx.db.insert("auditLog", {
      userId: args.userId,
      action: "MITOSIS_MANUAL_TRIGGER",
      recordType: "SYSTEM",
      recordId: "MITOSIS",
      changes: { triggeredBy: args.userId },
      timestamp: Date.now(),
    });

    // Run mitosis
    return await runMitosis(ctx, {});
  },
});

/**
 * Get mitosis statistics
 */
export const getMitosisStats = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("auditLog")
      .withIndex("by_record", (q) => 
        q.eq("recordType", "SYSTEM").eq("recordId", "MITOSIS")
      )
      .order("desc")
      .take(args.limit || 10);

    return runs.map(run => ({
      timestamp: new Date(run.timestamp).toISOString(),
      results: run.changes,
      triggeredBy: run.userId,
    }));
  },
});

/**
 * Initialize template "Golden Records"
 * These are preserved during mitosis and date-slid
 */
export const initializeTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    const templates = [
      {
        eptId: "TEMPLATE_INFANT_001",
        mrn: "T000001",
        firstName: "Baby",
        lastName: "Doe",
        dateOfBirth: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days old
        sex: "Male",
        guarantorId: "TEMPLATE_GUARANTOR_001",
        volatility: "DYNAMIC" as const,
        isTemplate: true,
        data: {
          relativeAge: 0.008, // 3 days in years
          description: "3-day-old infant template",
        },
      },
      {
        eptId: "TEMPLATE_CHILD_001",
        mrn: "T000002",
        firstName: "Johnny",
        lastName: "Smith",
        dateOfBirth: new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 years old
        sex: "Male",
        guarantorId: "TEMPLATE_GUARANTOR_002",
        volatility: "DYNAMIC" as const,
        isTemplate: true,
        data: {
          relativeAge: 10,
          description: "10-year-old child template",
        },
      },
      {
        eptId: "TEMPLATE_ADULT_001",
        mrn: "T000003",
        firstName: "Jane",
        lastName: "Johnson",
        dateOfBirth: new Date(Date.now() - 35 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 35 years old
        sex: "Female",
        guarantorId: "TEMPLATE_ADULT_001", // Self-guarantor (adult)
        volatility: "DYNAMIC" as const,
        isTemplate: true,
        data: {
          relativeAge: 35,
          description: "35-year-old adult template (self-guarantor)",
        },
      },
    ];

    const guarantors = [
      {
        earId: "TEMPLATE_GUARANTOR_001",
        name: "John Doe Sr.",
        address: "123 Main St",
        city: "Springfield",
        state: "IL",
        zip: "62701",
        volatility: "DYNAMIC" as const,
        data: { isTemplate: true },
      },
      {
        earId: "TEMPLATE_GUARANTOR_002",
        name: "Mary Smith",
        address: "456 Oak Ave",
        city: "Springfield",
        state: "IL",
        zip: "62702",
        volatility: "DYNAMIC" as const,
        data: { isTemplate: true },
      },
    ];

    const results = {
      templatesCreated: 0,
      guarantorsCreated: 0,
    };

    // Check if templates already exist
    const existingTemplates = await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("isTemplate"), true))
      .collect();

    if (existingTemplates.length > 0) {
      return {
        message: "Templates already initialized",
        existingCount: existingTemplates.length,
      };
    }

    // Create guarantors first
    for (const guarantor of guarantors) {
      await ctx.db.insert("guarantors", guarantor);
      results.guarantorsCreated++;
    }

    // Create patient templates
    for (const template of templates) {
      await ctx.db.insert("patients", template);
      results.templatesCreated++;
    }

    await ctx.db.insert("auditLog", {
      userId: "SYSTEM",
      action: "TEMPLATES_INITIALIZED",
      recordType: "SYSTEM",
      recordId: "TEMPLATES",
      changes: results,
      timestamp: Date.now(),
    });

    return results;
  },
});
