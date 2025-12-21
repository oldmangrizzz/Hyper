"use client";

import { useMemo, useState } from "react";

type ValidationSeverity = "HardStop" | "SoftStop" | "Warning" | "None";

type ValidationResult = {
  severity: ValidationSeverity;
  code: string;
  message: string;
};

type Patient = {
  eptId: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: "Male" | "Female";
  address: string;
  city: string;
  state: string;
  guarantorId?: string | null;
};

type Guarantor = {
  earId: string;
  name: string;
  address: string;
  city: string;
  state: string;
};

type Room = {
  romId: string;
  name: string;
  department: string;
  genderRestriction: "Male" | "Female" | "None";
};

type Bed = {
  bedId: string;
  roomId: string;
  name: string;
  status: "Available" | "Occupied" | "Housekeeping";
  genderRestriction: "Male" | "Female" | "None";
};

type FacilityNode = {
  level: string;
  name: string;
  identifier?: string;
  settings: Record<string, string | null>;
};

const patientTemplates: Patient[] = [
  {
    eptId: "TEMPLATE_INFANT_001",
    mrn: "T000001",
    firstName: "Baby",
    lastName: "Doe",
    dateOfBirth: "2025-12-17",
    sex: "Male",
    address: "123 Main St",
    city: "Springfield",
    state: "IL",
    guarantorId: "TEMPLATE_GUARANTOR_001",
  },
  {
    eptId: "TEMPLATE_CHILD_001",
    mrn: "T000002",
    firstName: "Johnny",
    lastName: "Smith",
    dateOfBirth: "2015-12-20",
    sex: "Male",
    address: "456 Oak Ave",
    city: "Springfield",
    state: "IL",
    guarantorId: "TEMPLATE_GUARANTOR_002",
  },
  {
    eptId: "TEMPLATE_ADULT_001",
    mrn: "T000003",
    firstName: "Jane",
    lastName: "Johnson",
    dateOfBirth: "1990-12-20",
    sex: "Female",
    address: "789 River Rd",
    city: "Springfield",
    state: "IL",
    guarantorId: "TEMPLATE_ADULT_001",
  },
];

const guarantors: Guarantor[] = [
  {
    earId: "TEMPLATE_GUARANTOR_001",
    name: "John Doe Sr.",
    address: "123 Main St",
    city: "Springfield",
    state: "IL",
  },
  {
    earId: "TEMPLATE_GUARANTOR_002",
    name: "Mary Smith",
    address: "456 Oak Ave",
    city: "Springfield",
    state: "IL",
  },
  {
    earId: "TEMPLATE_ADULT_001",
    name: "Jane Johnson",
    address: "789 River Rd",
    city: "Springfield",
    state: "IL",
  },
];

const rooms: Room[] = [
  {
    romId: "ROM-3001",
    name: "3 West - Pediatrics A",
    department: "DEP-3W-PED",
    genderRestriction: "Female",
  },
  {
    romId: "ROM-3002",
    name: "3 West - Pediatrics B",
    department: "DEP-3W-PED",
    genderRestriction: "None",
  },
];

const beds: Bed[] = [
  {
    bedId: "BED-3001A",
    roomId: "ROM-3001",
    name: "Bed A",
    status: "Available",
    genderRestriction: "Female",
  },
  {
    bedId: "BED-3001B",
    roomId: "ROM-3001",
    name: "Bed B",
    status: "Occupied",
    genderRestriction: "Female",
  },
  {
    bedId: "BED-3002A",
    roomId: "ROM-3002",
    name: "Bed A",
    status: "Available",
    genderRestriction: "None",
  },
  {
    bedId: "BED-3002B",
    roomId: "ROM-3002",
    name: "Bed B",
    status: "Housekeeping",
    genderRestriction: "None",
  },
];

const facilityChain: FacilityNode[] = [
  {
    level: "Department",
    name: "3 West Pediatrics (DEP)",
    identifier: "DEP-3W-PED",
    settings: {
      visitationHours: "10a - 8p",
      defaultPrinter: null,
      badgeAccess: "Peds Nurse",
    },
  },
  {
    level: "Revenue Location",
    name: "Main Campus Pavilion (EAF)",
    identifier: "RL-MAIN-PAV",
    settings: {
      visitationHours: "9a - 9p",
      defaultPrinter: "PAV-CH-01",
      badgeAccess: "Campus Staff",
    },
  },
  {
    level: "Service Area",
    name: "Cook Children’s (EAF)",
    identifier: "SA-CHILDREN",
    settings: {
      visitationHours: "8a - 8p",
      defaultPrinter: "SA-DEFAULT-01",
      badgeAccess: "Service Area Staff",
    },
  },
  {
    level: "Facility",
    name: "Health System North (EAF)",
    identifier: "FAC-NORTH",
    settings: {
      visitationHours: "24/7",
      defaultPrinter: "FAC-DEFAULT",
      badgeAccess: "System Staff",
    },
  },
  {
    level: "System Default (LSD)",
    name: "System Definitions",
    settings: {
      visitationHours: "24/7",
      defaultPrinter: "SYS-FALLBACK",
      badgeAccess: "Any",
    },
  },
];

const securityRoles: Record<
  string,
  { description: string; permissions: string[] }
> = {
  "Bed Planner": {
    description: "Command center assignment privileges",
    permissions: ["BED_ASSIGN", "BED_PLANNER", "VIEW_CENSUS"],
  },
  Registrar: {
    description: "Registration and coverage capture",
    permissions: ["REGISTRATION", "VERIFY_COVERAGE"],
  },
  "Unit Nurse": {
    description: "Unit-level patient management",
    permissions: ["REGISTRATION", "VIEW_CENSUS"],
  },
};

const trainingScenarios = [
  {
    id: "inheritance",
    name: "Inheritance Fail",
    detail:
      "Department overrides Service Area visitation hours with a blank value.",
    impact: "Navigator shows empty rule set",
  },
  {
    id: "filing",
    name: "Filing Order Fail",
    detail: "Medicaid listed before Primary in VFO calculator.",
    impact: "Instant claim denial",
  },
  {
    id: "bed",
    name: "Bed Logic Fail",
    detail: "Male patient placed into Female-only room (ROM).",
    impact: "Hard stop should trigger",
  },
  {
    id: "rte",
    name: "RTE Mapping Fail",
    detail: "Unmapped 271 EB code sits in Raw Data.",
    impact: "No POS collection prompt",
  },
  {
    id: "window",
    name: "Three-Day Window Fail",
    detail: "ED visit not bundled into Inpatient HAR.",
    impact: "Billing compliance risk",
  },
];

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return Math.max(age, 0);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function severityBadge(severity: ValidationSeverity) {
  const styles: Record<ValidationSeverity, string> = {
    HardStop: "bg-rose-100 text-rose-700 border border-rose-200",
    SoftStop: "bg-amber-100 text-amber-700 border border-amber-200",
    Warning: "bg-sky-100 text-sky-700 border border-sky-200",
    None: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  };
  return styles[severity];
}

function resolveSetting(
  key: string,
): { value: string | null; source: FacilityNode } {
  const match =
    facilityChain.find(
      (node) =>
        node.settings[key] !== null && node.settings[key] !== undefined,
    ) || facilityChain[facilityChain.length - 1];
  return { value: match.settings[key] ?? null, source: match };
}

export default function Home() {
  const [patient, setPatient] = useState<Patient>(patientTemplates[1]);
  const [guarantorId, setGuarantorId] = useState<string | null>(
    patientTemplates[1].guarantorId ?? null,
  );
  const [selectedTemplate, setSelectedTemplate] = useState(
    patientTemplates[1].eptId,
  );
  const [selectedBedId, setSelectedBedId] = useState(beds[0].bedId);
  const [bedPatientId, setBedPatientId] = useState(patientTemplates[2].eptId);
  const [selectedRole, setSelectedRole] =
    useState<keyof typeof securityRoles>("Unit Nurse");
  const [mitosisStats, setMitosisStats] = useState({
    runs: 3,
    lastRun: "2025-12-01T12:00:00Z",
    purged: 24,
    templatesUpdated: 3,
  });

  const registrationValidations = useMemo(() => {
    const results: ValidationResult[] = [];
    const age = calculateAge(patient.dateOfBirth);

    if (!guarantorId) {
      results.push({
        severity: "HardStop",
        code: "EPT_GUARANTOR_MISSING",
        message: "Patient must be linked to a guarantor (EAR).",
      });
    }

    if (age < 18 && (!guarantorId || guarantorId === patient.eptId)) {
      results.push({
        severity: "HardStop",
        code: "PEDIATRIC_SELF_GUARANTOR",
        message: "Pediatric patients cannot self-guarantee. Add a guardian EAR.",
      });
    }

    if (guarantorId) {
      const linkedGuarantor = guarantors.find(
        (g) => g.earId === guarantorId,
      );
      if (!linkedGuarantor) {
        results.push({
          severity: "HardStop",
          code: "EPT_GUARANTOR_INVALID",
          message: "Linked guarantor does not exist in EAR master file.",
        });
      } else if (linkedGuarantor.address !== patient.address) {
        results.push({
          severity: "SoftStop",
          code: "ADDRESS_MISMATCH",
          message:
            "Compliance warning: Patient address differs from guarantor address.",
        });
      }
    }

    return {
      results,
      hasHardStop: results.some((r) => r.severity === "HardStop"),
      hasSoftStop: results.some((r) => r.severity === "SoftStop"),
      age,
    };
  }, [patient, guarantorId]);

  const bedValidation = useMemo(() => {
    const bed = beds.find((b) => b.bedId === selectedBedId);
    const patientChoice = patientTemplates.find(
      (p) => p.eptId === bedPatientId,
    );
    if (!bed || !patientChoice) {
      return {
        severity: "HardStop" as ValidationSeverity,
        message: "Select a bed and a patient template.",
        code: "MISSING_SELECTION",
      };
    }
    const room = rooms.find((r) => r.romId === bed.roomId);

    if (bed.status !== "Available") {
      return {
        severity: "HardStop" as ValidationSeverity,
        code: "BED_NOT_AVAILABLE",
        message: `Bed is ${bed.status}.`,
      };
    }

    if (
      bed.genderRestriction !== "None" &&
      bed.genderRestriction !== patientChoice.sex
    ) {
      return {
        severity: "HardStop" as ValidationSeverity,
        code: "BED_GENDER_MISMATCH",
        message: `Cannot place ${patientChoice.sex} in ${bed.genderRestriction}-only bed.`,
      };
    }

    if (
      room &&
      room.genderRestriction !== "None" &&
      room.genderRestriction !== patientChoice.sex
    ) {
      return {
        severity: "HardStop" as ValidationSeverity,
        code: "ROOM_GENDER_MISMATCH",
        message: `Room requires ${room.genderRestriction} patients.`,
      };
    }

    return {
      severity: "None" as ValidationSeverity,
      code: "BED_ASSIGNMENT_VALID",
      message: "Assignment passes gender and availability checks.",
    };
  }, [selectedBedId, bedPatientId]);

  const effectiveSettings = useMemo(() => {
    return {
      visitation: resolveSetting("visitationHours"),
      printer: resolveSetting("defaultPrinter"),
      badge: resolveSetting("badgeAccess"),
    };
  }, []);

  const hasBedPlannerAccess = securityRoles[selectedRole].permissions.includes(
    "BED_PLANNER",
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-4 rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-2xl shadow-slate-900/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
                Epic Training Simulator
              </p>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Prelude &amp; Grand Central Flight Deck
              </h1>
              <p className="mt-2 max-w-3xl text-slate-200">
                Chronicle-inspired UI that exercises pediatric guarantor traps,
                gender-aware bed logic, facility inheritance, SEC 900 security,
                mitosis reset, and the five certification fail-states outlined in
                the Prelude and Simulator specs.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-emerald-100 ring-1 ring-inset ring-white/20">
              <div className="text-xs uppercase tracking-wide text-emerald-200">
                Status
              </div>
              <div className="text-base">UI Kernel Ready</div>
              <div className="text-xs text-slate-200">
                Static data · Interactive validations
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <p className="text-slate-200">Chronicles Span</p>
              <p className="text-lg font-semibold text-white">
                INI → Record → Contact → Item → Value
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <p className="text-slate-200">Pediatric Profile</p>
              <p className="text-lg font-semibold text-white">
                Hard Stops enforced on Finish Registration
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <p className="text-slate-200">Fail-States</p>
              <p className="text-lg font-semibold text-white">
                Inheritance · Filing Order · Bed · RTE · 3-Day
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Chronicles Kernel
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  Master Files at a glance
                </h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Static + Dynamic
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-slate-500">Static INIs</p>
                <p className="text-xl font-semibold">DEP · BED · ROM · EAF</p>
                <p className="text-xs text-slate-500">
                  Built by analysts, migrate via Data Courier
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-slate-500">Dynamic INIs</p>
                <p className="text-xl font-semibold">EPT · EAR · HSP</p>
                <p className="text-xs text-slate-500">
                  Purged nightly by Mitosis reset
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-slate-500">Security</p>
                <p className="text-xl font-semibold">ECL / SEC 900</p>
                <p className="text-xs text-slate-500">
                  Bed Planner check mirrors Hyperspace
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-slate-500">Navigators</p>
                <p className="text-xl font-semibold">LOR → LVN</p>
                <p className="text-xs text-slate-500">
                  Workflow Engine drives UI choice
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Golden Records
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  Template Patients
                </h2>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                Mitosis safe
              </span>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {patientTemplates.map((tmpl) => (
                <li
                  key={tmpl.eptId}
                  className="rounded-xl border border-slate-200 px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {tmpl.firstName} {tmpl.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        EPT: {tmpl.eptId} · MRN: {tmpl.mrn}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Age {calculateAge(tmpl.dateOfBirth)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Guarantor: {tmpl.guarantorId}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Training Traps
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  Fail-state dashboard
                </h2>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                5 active
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {trainingScenarios.map((scenario) => (
                <li
                  key={scenario.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2"
                >
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-rose-500" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {scenario.name}
                    </p>
                    <p className="text-xs text-slate-500">{scenario.detail}</p>
                    <p className="text-[11px] text-amber-700">
                      Impact: {scenario.impact}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Prelude Registration Simulator
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Pediatric Guarantor Trap
              </h2>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${severityBadge(
                registrationValidations.hasHardStop ? "HardStop" : "None",
              )}`}
            >
              Finish Registration{" "}
              {registrationValidations.hasHardStop
                ? "Blocked"
                : "Ready with checks"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Patient (EPT)
                  </h3>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      const tmpl = patientTemplates.find(
                        (p) => p.eptId === e.target.value,
                      );
                      if (tmpl) {
                        setSelectedTemplate(tmpl.eptId);
                        setPatient(tmpl);
                        setGuarantorId(tmpl.guarantorId ?? null);
                      }
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                  >
                    {patientTemplates.map((tmpl) => (
                      <option key={tmpl.eptId} value={tmpl.eptId}>
                        Load {tmpl.firstName} ({tmpl.eptId})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500">Name</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={patient.firstName}
                        onChange={(e) =>
                          setPatient({ ...patient, firstName: e.target.value })
                        }
                      />
                      <input
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={patient.lastName}
                        onChange={(e) =>
                          setPatient({ ...patient, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">DOB</label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={patient.dateOfBirth}
                      onChange={(e) =>
                        setPatient({ ...patient, dateOfBirth: e.target.value })
                      }
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Age {registrationValidations.age}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Sex</label>
                    <select
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={patient.sex}
                      onChange={(e) =>
                        setPatient({
                          ...patient,
                          sex: e.target.value as Patient["sex"],
                        })
                      }
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500">Address</label>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={patient.address}
                      onChange={(e) =>
                        setPatient({ ...patient, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Guarantor (EAR)
                  </h3>
                  <span className="text-xs text-slate-500">Required</span>
                </div>
                <select
                  value={guarantorId ?? ""}
                  onChange={(e) =>
                    setGuarantorId(e.target.value || null)
                  }
                  className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">-- Select EAR --</option>
                  {guarantors.map((g) => (
                    <option key={g.earId} value={g.earId}>
                      {g.name} ({g.earId})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  Pediatric constraint: if Age &lt; 18, guarantor cannot equal EPT.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Validation Stack
                  </h3>
                  <div className="flex gap-2 text-xs">
                    <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">
                      Hard Stop: {registrationValidations.hasHardStop ? "Yes" : "No"}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
                      Soft Stop: {registrationValidations.hasSoftStop ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {registrationValidations.results.length === 0 ? (
                    <div className="col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      All pediatric validations passed. Finish Registration is enabled.
                    </div>
                  ) : (
                    registrationValidations.results.map((result) => (
                      <div
                        key={result.code}
                        className={`rounded-xl px-3 py-2 text-sm ${severityBadge(
                          result.severity,
                        )}`}
                      >
                        <p className="font-semibold">{result.code}</p>
                        <p className="text-xs">{result.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Finish Registration
                    </p>
                    <p className="text-xs text-slate-600">
                      Button remains disabled if any Hard Stop is present.
                    </p>
                  </div>
                  <button
                    disabled={registrationValidations.hasHardStop}
                    className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                      registrationValidations.hasHardStop
                        ? "cursor-not-allowed bg-slate-200 text-slate-500"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    Finish Registration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Grand Central
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Bed Management with Gender Validation
                </h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${severityBadge(
                  bedValidation.severity,
                )}`}
              >
                {bedValidation.message}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <label className="text-xs text-slate-500">Patient Template</label>
                <select
                  value={bedPatientId}
                  onChange={(e) => setBedPatientId(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {patientTemplates.map((p) => (
                    <option key={p.eptId} value={p.eptId}>
                      {p.firstName} {p.lastName} ({p.sex})
                    </option>
                  ))}
                </select>
                <label className="mt-4 block text-xs text-slate-500">
                  Bed Selection
                </label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {beds.map((bed) => {
                    const room = rooms.find((r) => r.romId === bed.roomId);
                    return (
                      <option key={bed.bedId} value={bed.bedId}>
                        {room?.name} · {bed.name} ({bed.status})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Gender Logic (Hard Stops)
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                    Bed restriction must equal patient sex or be None.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                    Room restriction must equal patient sex or be None.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                    Bed status must be Available.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  SEC 900
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Bed Planner Access
                </h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${hasBedPlannerAccess ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
              >
                {hasBedPlannerAccess ? "Access Granted" : "Security Violation"}
              </span>
            </div>
            <label className="mt-3 block text-xs text-slate-500">
              User Security Class (ECL)
            </label>
            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as keyof typeof securityRoles)
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {Object.keys(securityRoles).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <p className="mt-3 text-sm text-slate-700">
              {securityRoles[selectedRole].description}
            </p>
            {!hasBedPlannerAccess && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                Security Violation: Missing BED_PLANNER security point in ECL.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Facility Structure
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Rule of Specificity (Bubble-Up)
              </h2>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Department overrides Facility
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                System default fallback
              </span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Effective Settings (3 West Pediatrics)
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <p className="text-xs text-slate-500">Visitation Hours</p>
                  <p className="font-semibold text-slate-900">
                    {effectiveSettings.visitation.value}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Source: {effectiveSettings.visitation.source.level}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <p className="text-xs text-slate-500">Default Printer</p>
                  <p className="font-semibold text-slate-900">
                    {effectiveSettings.printer.value}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Source: {effectiveSettings.printer.source.level}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <p className="text-xs text-slate-500">Badge Access</p>
                  <p className="font-semibold text-slate-900">
                    {effectiveSettings.badge.value}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Source: {effectiveSettings.badge.source.level}
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {facilityChain.map((node) => (
                  <div
                    key={node.level}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {node.level}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {node.name}
                    </p>
                    {node.identifier && (
                      <p className="text-xs text-slate-500">
                        Identifier: {node.identifier}
                      </p>
                    )}
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <p>Visitation: {node.settings.visitationHours ?? "—"}</p>
                      <p>Printer: {node.settings.defaultPrinter ?? "—"}</p>
                      <p>Badge: {node.settings.badgeAccess ?? "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Mitosis Reset Engine
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Nightly Purge + Date Sliding
                </h2>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                Dynamic records only
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-slate-500">Last Run</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatDateTime(mitosisStats.lastRun)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-slate-500">Templates Updated</p>
                <p className="text-lg font-semibold text-slate-900">
                  {mitosisStats.templatesUpdated}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-slate-500">Dynamic Purged</p>
                <p className="text-lg font-semibold text-slate-900">
                  {mitosisStats.purged}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-slate-500">Runs</p>
                <p className="text-lg font-semibold text-slate-900">
                  {mitosisStats.runs}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setMitosisStats((prev) => ({
                  runs: prev.runs + 1,
                  lastRun: new Date().toISOString(),
                  purged: prev.purged + 12,
                  templatesUpdated: prev.templatesUpdated + 1,
                }))
              }
              className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Run mitosis now
            </button>
            <p className="mt-2 text-xs text-slate-600">
              Purges non-template EPT/EAR/HSP, preserves Golden Records, slides dates
              forward.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Training Scenarios
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Game Over Traps
                </h2>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Interactive cues
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {trainingScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {scenario.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {scenario.detail}
                      </p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
                      Trap Primed
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    Expected Outcome: {scenario.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
