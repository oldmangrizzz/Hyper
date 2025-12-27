"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Card,
  CardHeader,
  Alert,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
} from "./ui";

export default function SecurityModule() {
  // Query security classes
  const securityClasses = [
    {
      classId: "SEC-BED-PLANNER",
      name: "Bed Planner",
      description: "Command center assignment privileges",
      permissions: ["BED_ASSIGN", "BED_PLANNER", "VIEW_CENSUS", "VIEW_PATIENTS"],
    },
    {
      classId: "SEC-REGISTRAR",
      name: "Registrar",
      description: "Registration and coverage capture",
      permissions: ["REGISTRATION", "VERIFY_COVERAGE", "CREATE_PATIENT", "CREATE_GUARANTOR"],
    },
    {
      classId: "SEC-UNIT-NURSE",
      name: "Unit Nurse",
      description: "Unit-level patient management",
      permissions: ["REGISTRATION", "VIEW_CENSUS", "VIEW_PATIENTS"],
    },
    {
      classId: "SEC-ADMIN",
      name: "System Administrator",
      description: "Full system access",
      permissions: ["*"],
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Security Classes (SEC 900)"
          subtitle="ECL - Epic Security Class Management"
          badge={<Badge variant="info">4 Classes Configured</Badge>}
        />
        <div className="mt-6">
          <Alert variant="info">
            <p className="font-semibold">About SEC 900</p>
            <p className="mt-1 text-sm">
              SEC 900 is Epic's security architecture. Security Classes (ECL) define permission sets
              that control what users can access and modify. The simulator enforces these permissions
              to replicate real Epic behavior.
            </p>
          </Alert>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {securityClasses.map((secClass) => (
          <Card key={secClass.classId}>
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{secClass.name}</h3>
                  <p className="text-xs text-slate-500">{secClass.classId}</p>
                </div>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{secClass.description}</p>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Permissions
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {secClass.permissions.map((perm) => (
                  <Badge key={perm} variant="default" size="sm">
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-700">Use Case</p>
              <p className="mt-1 text-slate-600">
                {secClass.classId === "SEC-BED-PLANNER" && 
                  "Required for Command Center bed assignment operations"}
                {secClass.classId === "SEC-REGISTRAR" && 
                  "Required for patient registration and insurance verification"}
                {secClass.classId === "SEC-UNIT-NURSE" && 
                  "Standard access for floor nurses - view only for bed planning"}
                {secClass.classId === "SEC-ADMIN" && 
                  "Full administrative access to all simulator functions"}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Security Validation Examples" subtitle="Hard Stops in Action" />
        <div className="mt-6 space-y-4">
          <Alert variant="warning">
            <p className="font-semibold">Example: Bed Planner Security Violation</p>
            <p className="mt-2 text-sm">
              If a user with only "Unit Nurse" security class attempts to assign a patient to a bed:
            </p>
            <div className="mt-3 rounded bg-rose-100 p-3 text-sm text-rose-900">
              <p className="font-semibold">ERROR: Security Violation</p>
              <p className="mt-1">
                Missing security point: BED_PLANNER<br/>
                User security class: SEC-UNIT-NURSE<br/>
                Required class: SEC-BED-PLANNER or SEC-ADMIN
              </p>
            </div>
          </Alert>

          <div className="rounded-xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900">Permission Inheritance</h4>
            <p className="mt-2 text-sm text-slate-600">
              In Epic, security is typically assigned at the User Template (EMP) level.
              Users can have multiple security classes, and permissions are cumulative.
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm">Allowed</Badge>
                <span className="text-slate-700">
                  User with both SEC-REGISTRAR and SEC-BED-PLANNER can do both registration and bed assignment
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="error" size="sm">Blocked</Badge>
                <span className="text-slate-700">
                  User with only SEC-UNIT-NURSE cannot assign beds (BED_PLANNER permission missing)
                </span>
              </div>
            </div>
          </div>

          <Alert variant="info">
            <p className="font-semibold">Exam Tip</p>
            <p className="mt-1 text-sm">
              A common certification question: "Nurse Jane sees error message when trying to transfer
              a patient. What security point is missing?" Always check the required permissions for
              the attempted action!
            </p>
          </Alert>
        </div>
      </Card>
    </div>
  );
}
