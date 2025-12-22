"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import {
  Card,
  CardHeader,
  Alert,
  Badge,
} from "./ui";
import { Id } from "../../convex/_generated/dataModel";

export default function FacilitiesModule() {
  const [selectedDeptId, setSelectedDeptId] = useState<Id<"departments"> | null>(null);

  const departments = useQuery(api.crud.listDepartments, {});
  const facilities = useQuery(api.crud.listFacilities, {});

  const hierarchy = selectedDeptId ?
    useQuery(api.facilityStructure.getFacilityHierarchy, { departmentId: selectedDeptId }) : null;

  const deptSettings = selectedDeptId ?
    useQuery(api.facilityStructure.getDepartmentSettings, { departmentId: selectedDeptId }) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader title="Departments" subtitle="DEP Records" />
        <div className="mt-4 space-y-2">
          {departments === undefined && <p className="text-sm text-slate-500">Loading...</p>}
          {departments && departments.length === 0 && (
            <Alert variant="info">No departments configured.</Alert>
          )}
          {departments && departments.map((dept) => (
            <div
              key={dept._id}
              className={`cursor-pointer rounded-lg border p-3 transition hover:bg-slate-50 ${
                selectedDeptId === dept._id ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
              }`}
              onClick={() => setSelectedDeptId(dept._id)}
            >
              <p className="font-semibold text-slate-900">{dept.name}</p>
              <p className="text-xs text-slate-500">{dept.depId}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Facility Hierarchy & Settings" subtitle="Rule of Specificity (Bubble-Up)" />
        {!hierarchy && (
          <div className="mt-6">
            <Alert variant="info">
              Select a department to view its facility hierarchy and settings inheritance.
            </Alert>
          </div>
        )}
        {hierarchy && !("error" in hierarchy) && (
          <div className="mt-6 space-y-4">
            <Alert variant="info">
              <p className="font-semibold">Rule of Specificity</p>
              <p className="mt-1 text-sm">
                Settings are inherited from more general to more specific levels.
                Department-level settings override facility settings.
              </p>
            </Alert>

            <div className="space-y-3">
              {hierarchy.map((node, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 p-4"
                  style={{ marginLeft: `${idx * 16}px` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="default" size="sm">{node.level}</Badge>
                      <h3 className="mt-1 font-semibold text-slate-900">{node.name}</h3>
                      {node.identifier && (
                        <p className="text-xs text-slate-500">{node.identifier}</p>
                      )}
                    </div>
                  </div>
                  {Object.keys(node.settings).length > 0 && (
                    <div className="mt-3 space-y-1 text-sm">
                      {Object.entries(node.settings).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-slate-600">{key}:</span>
                          <span className="font-medium text-slate-900">
                            {value === null || value === undefined ? (
                              <span className="text-slate-400">—</span>
                            ) : (
                              String(value)
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {deptSettings && !("error" in deptSettings) && (
              <div className="rounded-xl bg-emerald-50 p-4">
                <h4 className="font-semibold text-emerald-900">Effective Settings</h4>
                <p className="text-xs text-emerald-700">
                  These are the actual settings that will be used for {deptSettings.department.name}
                </p>
                <div className="mt-3 space-y-2">
                  {Object.entries(deptSettings.settings).map(([key, result]) => (
                    <div key={key} className="rounded-lg bg-white p-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-900">{key}:</span>
                        <span className="text-slate-700">
                          {result.value === null || result.value === undefined ? (
                            <span className="text-slate-400">Not configured</span>
                          ) : (
                            String(result.value)
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-600">
                        Source: {result.source}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
