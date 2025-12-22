"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import {
  Card,
  CardHeader,
  Alert,
  Button,
  Badge,
  Modal,
} from "./ui";

export default function MitosisModule() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const lastRun = useQuery(api.mitosis.getLastMitosisRun);
  const mitosisStats = useQuery(api.mitosis.getMitosisStats, { limit: 10 });
  const runMitosis = useMutation(api.mitosis.triggerMitosisManually);

  const handleRunMitosis = async () => {
    setIsRunning(true);
    try {
      await runMitosis({ userId: "ADMIN" });
      setShowConfirmModal(false);
    } catch (error) {
      alert("Failed to run mitosis: " + error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader
          title="Mitosis Reset Engine"
          subtitle="Data Cleanup & Template Management"
          badge={<Badge variant="warning">Dynamic Records Only</Badge>}
        />
        <div className="mt-6 space-y-4">
          <Alert variant="info">
            <p className="font-semibold">What is Mitosis?</p>
            <p className="mt-1 text-sm">
              Mitosis is the nightly cleanup process that prevents environment rot by:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1 text-sm">
              <li>Purging non-template dynamic records (EPT, EAR, HSP)</li>
              <li>Preserving "Golden Records" (template patients)</li>
              <li>Date-sliding templates to maintain relative ages</li>
            </ul>
          </Alert>

          {lastRun && (
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">Last Run</h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Timestamp:</dt>
                  <dd className="font-medium">
                    {new Date(lastRun.timestamp).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Patients Deleted:</dt>
                  <dd className="font-medium">{lastRun.changes.patientsDeleted}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Guarantors Deleted:</dt>
                  <dd className="font-medium">{lastRun.changes.guarantorsDeleted}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Templates Updated:</dt>
                  <dd className="font-medium">{lastRun.changes.templatesUpdated}</dd>
                </div>
              </dl>
            </div>
          )}

          <Button
            variant="danger"
            size="lg"
            className="w-full"
            onClick={() => setShowConfirmModal(true)}
            disabled={isRunning}
          >
            {isRunning ? "Running Mitosis..." : "Run Mitosis Now"}
          </Button>

          <Alert variant="warning">
            <p className="text-sm">
              ⚠️ This will delete all non-template dynamic records. Template patients will be preserved and date-slid.
            </p>
          </Alert>
        </div>
      </Card>

      <Card>
        <CardHeader title="Mitosis History" subtitle="Recent Runs" />
        <div className="mt-4 space-y-2">
          {mitosisStats === undefined && (
            <p className="text-sm text-slate-500">Loading...</p>
          )}
          {mitosisStats && mitosisStats.length === 0 && (
            <Alert variant="info">No mitosis runs recorded yet.</Alert>
          )}
          {mitosisStats && mitosisStats.map((run, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">
                    {new Date(run.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    Triggered by {run.triggeredBy}
                  </p>
                </div>
                <Badge variant="success" size="sm">Completed</Badge>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-slate-500">Patients</p>
                  <p className="font-semibold">{run.results.patientsDeleted}</p>
                </div>
                <div>
                  <p className="text-slate-500">Guarantors</p>
                  <p className="font-semibold">{run.results.guarantorsDeleted}</p>
                </div>
                <div>
                  <p className="text-slate-500">Templates</p>
                  <p className="font-semibold">{run.results.templatesUpdated}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Mitosis Reset"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRunMitosis} disabled={isRunning}>
              {isRunning ? "Running..." : "Confirm and Run"}
            </Button>
          </>
        }
      >
        <Alert variant="warning">
          <p className="font-semibold">This action will:</p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>Delete all non-template patient records (EPT)</li>
            <li>Delete non-linked guarantor records (EAR)</li>
            <li>Delete all hospital accounts (HSP)</li>
            <li>Update template records with new dates</li>
          </ul>
          <p className="mt-3">Template "Golden Records" will be preserved.</p>
        </Alert>
      </Modal>
    </div>
  );
}
