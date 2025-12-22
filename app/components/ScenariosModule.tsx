"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Card,
  CardHeader,
  Alert,
  Badge,
  StatusDot,
} from "./ui";

export default function ScenariosModule() {
  // In a real implementation, we'd query scenarios from the database
  const scenarios = [
    {
      id: "inheritance-fail",
      name: "Inheritance Fail",
      description: "Department overrides Service Area visitation hours with a blank value",
      impact: "Navigator shows empty rule set instead of parent value",
      severity: "High",
      module: "Facility Structure",
      status: "active",
    },
    {
      id: "filing-order-fail",
      name: "Filing Order Fail",
      description: "Medicaid listed before Primary insurance in VFO calculator",
      impact: "Instant claim denial - Payer of Last Resort violation",
      severity: "Critical",
      module: "Prelude / Eligibility",
      status: "active",
    },
    {
      id: "bed-logic-fail",
      name: "Bed Logic Fail",
      description: "Male patient placed into Female-only room (ROM)",
      impact: "Hard stop should trigger, preventing assignment",
      severity: "High",
      module: "Grand Central",
      status: "active",
    },
    {
      id: "rte-mapping-fail",
      name: "RTE Mapping Fail",
      description: "Unmapped 271 EB code sits in Raw Data without CMG mapping",
      impact: "No POS collection prompt, eligibility data not filed",
      severity: "Medium",
      module: "Eligibility (RTE)",
      status: "active",
    },
    {
      id: "three-day-window-fail",
      name: "Three-Day Window Fail",
      description: "ED visit not bundled into Inpatient HAR",
      impact: "Billing compliance risk, potential duplicate charges",
      severity: "High",
      module: "Grand Central / Resolute",
      status: "active",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Training Scenarios"
          subtitle="Certification Fail-States"
          badge={<Badge variant="warning">5 Active Scenarios</Badge>}
        />
        <div className="mt-6">
          <Alert variant="info">
            <p className="font-semibold">About Training Scenarios</p>
            <p className="mt-1 text-sm">
              These scenarios replicate the 5 common "Game Over" traps that appear in Epic certification
              exams. Each represents a critical configuration error that candidates must identify and fix.
            </p>
          </Alert>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {scenarios.map((scenario) => (
          <Card key={scenario.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <StatusDot
                  status={
                    scenario.severity === "Critical" ? "error" :
                    scenario.severity === "High" ? "warning" : "info"
                  }
                  pulse
                />
                <div>
                  <h3 className="font-semibold text-slate-900">{scenario.name}</h3>
                  <p className="text-xs text-slate-500">{scenario.module}</p>
                </div>
              </div>
              <Badge
                variant={
                  scenario.severity === "Critical" ? "error" :
                  scenario.severity === "High" ? "warning" : "info"
                }
                size="sm"
              >
                {scenario.severity}
              </Badge>
            </div>
            
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Scenario
                </p>
                <p className="mt-1 text-sm text-slate-700">{scenario.description}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Expected Impact
                </p>
                <p className="mt-1 text-sm text-rose-700">{scenario.impact}</p>
              </div>

              <div className="rounded-lg bg-amber-50 p-3 text-sm">
                <p className="font-semibold text-amber-900">Training Objective</p>
                <p className="mt-1 text-amber-800">
                  {scenario.id === "inheritance-fail" && "Understand Rule of Specificity and setting inheritance hierarchy"}
                  {scenario.id === "filing-order-fail" && "Master VFO (Visit Filing Order) configuration and Medicare Secondary Payer rules"}
                  {scenario.id === "bed-logic-fail" && "Configure gender restrictions at both ROM and BED levels with proper hard stops"}
                  {scenario.id === "rte-mapping-fail" && "Map 271 eligibility response codes to Component Groups (CMGs) for POS collection"}
                  {scenario.id === "three-day-window-fail" && "Configure Event Management logic for ED-to-Inpatient bundling"}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="How to Use Training Scenarios" subtitle="Study Guide" />
        <div className="mt-6 space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-900">Review the Scenario</p>
                <p className="text-sm text-slate-600">
                  Read the description and understand what configuration error exists
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-900">Identify the Module</p>
                <p className="text-sm text-slate-600">
                  Navigate to the relevant module in the simulator (Prelude, Grand Central, etc.)
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-900">Test the Fail-State</p>
                <p className="text-sm text-slate-600">
                  Attempt the action that should fail (e.g., assign male to female-only room)
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                4
              </div>
              <div>
                <p className="font-semibold text-slate-900">Observe the Outcome</p>
                <p className="text-sm text-slate-600">
                  Verify that the expected hard stop or error appears as described
                </p>
              </div>
            </div>
          </div>

          <Alert variant="success">
            <p className="font-semibold">Exam Tip</p>
            <p className="mt-1 text-sm">
              In the actual certification exam, you'll be asked to identify which configuration
              is causing a specific error. Practice recognizing these patterns!
            </p>
          </Alert>
        </div>
      </Card>
    </div>
  );
}
