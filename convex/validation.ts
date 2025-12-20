// Validation Logic for Epic Simulator
// Implements Hard Stops and Soft Stops per Pediatric Profile

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Validate Guarantor Linkage (Hard Stop)
 * Every EPT record must be linked to at least one EAR record
 */
export const validateGuarantorLinkage = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    
    if (!patient) {
      return {
        isValid: false,
        severity: "HardStop",
        code: "EPT_GUARANTOR_MISSING",
        message: "Patient record must be linked to a guarantor (EAR).",
      };
    }

    if (!patient.guarantorId) {
      return {
        isValid: false,
        severity: "HardStop",
        code: "EPT_GUARANTOR_MISSING",
        message: "Patient record must be linked to a guarantor (EAR).",
      };
    }

    // Check if guarantor exists
    const guarantor = await ctx.db
      .query("guarantors")
      .withIndex("by_earId", (q) => q.eq("earId", patient.guarantorId))
      .first();

    if (!guarantor) {
      return {
        isValid: false,
        severity: "HardStop",
        code: "EPT_GUARANTOR_INVALID",
        message: "Linked guarantor (EAR) record does not exist.",
      };
    }

    return {
      isValid: true,
      severity: "None",
      code: "EPT_GUARANTOR_VALID",
      message: "Guarantor linkage is valid.",
    };
  },
});

/**
 * Validate Age Constraint (Hard Stop - Pediatric Profile)
 * If Patient.Age < 18, then EAR.ID cannot equal EPT.ID
 */
export const validatePediatricGuarantor = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    
    if (!patient) {
      return {
        isValid: false,
        severity: "HardStop",
        code: "EPT_NOT_FOUND",
        message: "Patient record not found.",
      };
    }

    const age = calculateAge(patient.dateOfBirth);

    // Pediatric constraint: patients under 18 cannot be their own guarantor
    if (age < 18) {
      if (!patient.guarantorId) {
        return {
          isValid: false,
          severity: "HardStop",
          code: "PEDIATRIC_GUARANTOR_REQUIRED",
          message: "Pediatric patients (age < 18) must have a separate guarantor.",
        };
      }

      // Check if patient is trying to be their own guarantor
      if (patient.guarantorId === patient.eptId) {
        return {
          isValid: false,
          severity: "HardStop",
          code: "PEDIATRIC_SELF_GUARANTOR",
          message: "Pediatric patients cannot be their own guarantor. Age: " + age,
        };
      }
    }

    return {
      isValid: true,
      severity: "None",
      code: "PEDIATRIC_GUARANTOR_VALID",
      message: "Pediatric guarantor validation passed.",
    };
  },
});

/**
 * Validate Address Mismatch (Soft Stop)
 * If EAR address differs from Subscriber address, trigger warning
 */
export const validateAddressMismatch = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    
    if (!patient || !patient.guarantorId) {
      return {
        isValid: true,
        severity: "None",
        code: "ADDRESS_CHECK_SKIPPED",
        message: "Address validation skipped - no guarantor linked.",
      };
    }

    const guarantor = await ctx.db
      .query("guarantors")
      .withIndex("by_earId", (q) => q.eq("earId", patient.guarantorId))
      .first();

    if (!guarantor) {
      return {
        isValid: true,
        severity: "None",
        code: "ADDRESS_CHECK_SKIPPED",
        message: "Address validation skipped - guarantor not found.",
      };
    }

    // Get patient address from data object
    const patientAddress = patient.data.address as string | undefined;
    const guarantorAddress = guarantor.address;

    if (patientAddress && guarantorAddress && patientAddress !== guarantorAddress) {
      return {
        isValid: false,
        severity: "SoftStop",
        code: "ADDRESS_MISMATCH",
        message: "Compliance Warning: Patient address differs from Guarantor address.",
      };
    }

    return {
      isValid: true,
      severity: "None",
      code: "ADDRESS_MATCH",
      message: "Address validation passed.",
    };
  },
});

/**
 * Comprehensive validation check for patient registration
 * Returns all validation errors and warnings
 */
export const validatePatientRegistration = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const validations = [];

    // Check guarantor linkage
    const guarantorLinkage = await validateGuarantorLinkage(ctx, args);
    if (!guarantorLinkage.isValid || guarantorLinkage.severity !== "None") {
      validations.push(guarantorLinkage);
    }

    // Check pediatric guarantor constraint
    const pediatricGuarantor = await validatePediatricGuarantor(ctx, args);
    if (!pediatricGuarantor.isValid || pediatricGuarantor.severity !== "None") {
      validations.push(pediatricGuarantor);
    }

    // Check address mismatch
    const addressMismatch = await validateAddressMismatch(ctx, args);
    if (!addressMismatch.isValid || addressMismatch.severity !== "None") {
      validations.push(addressMismatch);
    }

    const hasHardStops = validations.some((v) => v.severity === "HardStop");
    const hasSoftStops = validations.some((v) => v.severity === "SoftStop");

    return {
      isValid: !hasHardStops,
      canProceedWithWarning: !hasHardStops && hasSoftStops,
      validations,
      summary: {
        hardStops: validations.filter((v) => v.severity === "HardStop").length,
        softStops: validations.filter((v) => v.severity === "SoftStop").length,
        warnings: validations.filter((v) => v.severity === "Warning").length,
      },
    };
  },
});

/**
 * Store validation results in the database
 */
export const recordValidation = mutation({
  args: {
    recordType: v.string(),
    recordId: v.string(),
    severity: v.string(),
    message: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("validations", {
      recordType: args.recordType,
      recordId: args.recordId,
      severity: args.severity,
      message: args.message,
      code: args.code,
      timestamp: Date.now(),
    });
  },
});

/**
 * Get all validations for a specific record
 */
export const getValidations = query({
  args: {
    recordType: v.string(),
    recordId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("validations")
      .withIndex("by_record", (q) => 
        q.eq("recordType", args.recordType).eq("recordId", args.recordId)
      )
      .order("desc")
      .take(50);
  },
});

/**
 * Clear validations for a specific record
 */
export const clearValidations = mutation({
  args: {
    recordType: v.string(),
    recordId: v.string(),
  },
  handler: async (ctx, args) => {
    const validations = await ctx.db
      .query("validations")
      .withIndex("by_record", (q) => 
        q.eq("recordType", args.recordType).eq("recordId", args.recordId)
      )
      .collect();

    for (const validation of validations) {
      await ctx.db.delete(validation._id);
    }

    return { deleted: validations.length };
  },
});
