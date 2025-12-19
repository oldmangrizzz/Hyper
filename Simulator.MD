MISSION PROFILE: PROJECT IRON
PRELUDE (COPILOT ARCHITECT SPEC)
1. Executive Summary: The "Flight Simulator" Goal
This specification is designed to be ingested by GitHub Copilot Pro to generate a web-based
training environment. The app must simulate the underlying logic of Epic’s Chronicles
database—specifically for the Prelude (Registration) and Grand Central (ADT)
modules—without utilizing actual proprietary software. The goal is to train Principal Trainer (PT)
candidates for their TED 300 and MST certification exams.
Core Tech Stack:
●
●
●
Frontend: Next.js (React) + TypeScript.
Backend/Database: Convex.dev (Reactive Database).
Logic: TypeScript for Business Rules and Schema Validation.
2. Phase 1: The Chronicles Data Kernel (Convex
Schema)
The database must replicate the INI > Record > Contact > Item > Value hierarchy.
2.1 Static vs. Dynamic Distinction
The simulator must strictly differentiate between volatility types :
●
Static (Administrative): Built by analysts (DEP, EAF, ROM, BED, SEC 900). These are
preserved by the system.
●
Dynamic (Transactional): Created by users (EPT, EAR, HSP). These are wiped during
the "Mitosis" reset.
2.2 TypeScript Schema for Convex
// Define this in convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
// Master Files (INIs)
records: defineTable({
ini: v.string(), // e.g.,
"EPT"
,
"EAR"
"DEP"
,
recordId: v.string(), // The.1 Item ID
name: v.string(), // The.2 Item (Record Name)
volatility: v.union(v.literal("STATIC"), v.literal("DYNAMIC")),
parentId: v.optional(v.id("records")), // For Facility Structure
hierarchy
isTemplate: v.optional(v.boolean()), // For "Golden Records"
data: v.map(v.string(), v.any()), // Keyed by Item Number
(e.g.,
"110": "DOB")
}).index("by
ini
record"
, ["ini"
,
"recordId"]),
_
_
// Security (SEC 900 / ECL)
security
_
classes: defineTable({
classId: v.string(),
permissions: v.array(v.string()),
}),
});
3. Phase 2: The Pediatric "Guarantor Trap"
In a pediatric setting (Cook Children's Profile), the patient (EPT) cannot be their own guarantor
(EAR).
3.1 Validation Logic Engine
The "Finish Registration" button must remain disabled if any of these hard stops are active :
1. Guarantor Linkage: Every EPT record must be linked to at least one EAR record.
2. Age Constraint: If Patient.Age < 18, then EAR.ID cannot equal EPT.ID.
3. Address Mismatch: If the EAR address differs from the Subscriber address, trigger a
"Compliance Warning" (Soft Stop).
4. Phase 3: Rule of Specificity & Security (SEC 900)
Configuration settings (e.g., visitation hours, default printers) are inherited down the Facility
Structure : Facility (EAF) > Service Area (EAF) > Revenue Location (EAF) > Department
(DEP).
4.1 Recursive "Bubble-Up" Lookup
The system must check the current Department (DEP) first. If a setting is null, it must recursively
query the parent EAF records until it hits the Facility level or a System Definition (LSD).
4.2 Security Architecture (SEC 900)
Implement the Security Class (INI: ECL). If a user tries to access the "Bed Planner" without the
correct security point in their User Record (EMP), the simulator must throw a "Security Violation"
error mirroring actual Epic behavior [1, User Image].
5. Phase 4: The "Mitosis" Reset Engine
To prevent "environment rot,
" the system runs a nightly mitigation script.
Logic for run
_
mitosis():
1. Identify: Query all records where volatility === "DYNAMIC"
.
2. Purge: Delete all user-created Dynamic records (non-template EPT, EAR, HSP).
3. Date Sliding: For "Golden Records" (Templates), recalculate any date-sensitive items
relative to Today. (e.g., If a template patient is "3 days old,
" update their DOB to
Date.now() - 3 days).
6. Training Scenarios: "Game Over" Traps
The simulator must be capable of generating these 5 fail-states to test the PT candidate :
1. The Inheritance Fail: A setting configured at the Service Area is overridden by a blank or
contradictory setting at the Department level.
2. The Filing Order Fail: Medicaid is listed before Private Insurance, violating "Payer of
Last Resort" rules.
3. The Bed Logic Fail: Admitting a Male patient to a Female-only Room (ROM) because
the analyst forgot to set the Gender attribute.
4. The RTE Mapping Fail: A 271 Eligibility response code is not mapped to a Component
Group (CMG), leaving data in "Raw Data"
.
5. The Three-Day Window Fail: An Emergency (HOV) visit is not correctly bundled into an
Inpatient admission, causing a billing compliance violation.
Works cited
1. Understanding Epic Chronicles Data Structure: A Comprehensive Guide | Exams Nursing |
Docsity,
https://www.docsity.com/en/docs/cln-251-252-configuring-the-epic-end-user-clinical-shared-too-
much-information-this-mate/13116375/ 2. Master Files - Connect Care Builders,
https://builders.connect-care.ca/Resources/master-files
