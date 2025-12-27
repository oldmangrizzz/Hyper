"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  Badge,
  Button,
  Alert,
  Modal,
  LoadingOverlay,
  StatusDot,
} from "./components/ui";
import RegistrationModule from "./components/RegistrationModule";
import BedManagementModule from "./components/BedManagementModule";
import FacilitiesModule from "./components/FacilitiesModule";
import SecurityModule from "./components/SecurityModule";
import MitosisModule from "./components/MitosisModule";
import ScenariosModule from "./components/ScenariosModule";

type TabType = "overview" | "registration" | "bedManagement" | "facilities" | "security" | "mitosis" | "scenarios";

export default function EpicSimulator() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isInitializing, setIsInitializing] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);

  // Query system status
  const systemStatus = useQuery(api.seedData.getSystemStatus);
  const initializeSystem = useMutation(api.seedData.initializeSystem);
  const initializeTemplates = useMutation(api.mitosis.initializeTemplates);

  // Auto-show init modal if system is not initialized
  useEffect(() => {
    if (systemStatus && !systemStatus.isInitialized) {
      setShowInitModal(true);
    }
  }, [systemStatus]);

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await initializeSystem();
      await initializeTemplates();
      setShowInitModal(false);
    } catch (error) {
      console.error("Initialization error:", error);
      alert("Failed to initialize system: " + String(error));
    } finally {
      setIsInitializing(false);
    }
  };

  if (systemStatus === undefined) {
    return <LoadingOverlay message="Loading Epic Simulator..." />;
  }

  const tabs: Array<{ id: TabType; label: string; badge?: string }> = [
    { id: "overview", label: "Overview" },
    { id: "registration", label: "Prelude Registration", badge: "EPT/EAR" },
    { id: "bedManagement", label: "Grand Central", badge: "BED/ROM" },
    { id: "facilities", label: "Facility Structure", badge: "EAF/DEP" },
    { id: "security", label: "Security (SEC 900)", badge: "ECL" },
    { id: "mitosis", label: "Mitosis Reset" },
    { id: "scenarios", label: "Training Scenarios" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {isInitializing && <LoadingOverlay message="Initializing system..." />}

      {/* Initialization Modal */}
      <Modal
        isOpen={showInitModal}
        onClose={() => setShowInitModal(false)}
        title="System Initialization Required"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowInitModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleInitialize}>
              Initialize System
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="info">
            The Epic Simulator needs to be initialized with base data including:
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>Facility structure (EAF)</li>
              <li>Departments (DEP)</li>
              <li>Rooms and Beds (ROM/BED)</li>
              <li>Security Classes (ECL)</li>
              <li>System Configuration (LSD)</li>
              <li>Training Scenarios</li>
              <li>Template Patient Records (Golden Records)</li>
            </ul>
          </Alert>
          <p className="text-sm text-slate-600">
            This will create the necessary static and template data for the training environment.
            You only need to do this once.
          </p>
        </div>
      </Modal>

      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="mb-8 rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
                Epic Training Simulator
              </p>
              <h1 className="text-4xl font-semibold">
                Prelude & Grand Central Flight Deck
              </h1>
              <p className="mt-2 max-w-3xl text-slate-200">
                Production-ready Chronicles-inspired UI for pediatric guarantor validation,
                gender-aware bed logic, facility inheritance, SEC 900 security, mitosis reset,
                and certification fail-states.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm ring-1 ring-white/20">
              <div className="text-xs uppercase tracking-wide text-emerald-200">Status</div>
              <div className="flex items-center gap-2">
                <StatusDot 
                  status={systemStatus.isInitialized ? "success" : "warning"} 
                  pulse={!systemStatus.isInitialized}
                />
                <span className="font-semibold">
                  {systemStatus.isInitialized ? "System Ready" : "Not Initialized"}
                </span>
              </div>
              {systemStatus.isInitialized && (
                <div className="mt-1 text-xs text-slate-200">
                  {systemStatus.counts.patients} Patients • {systemStatus.counts.beds} Beds
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {systemStatus.isInitialized && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs text-slate-300">Departments</p>
                <p className="text-2xl font-semibold">{systemStatus.counts.departments}</p>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs text-slate-300">Rooms</p>
                <p className="text-2xl font-semibold">{systemStatus.counts.rooms}</p>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs text-slate-300">Beds</p>
                <p className="text-2xl font-semibold">{systemStatus.counts.beds}</p>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs text-slate-300">Patients</p>
                <p className="text-2xl font-semibold">{systemStatus.counts.patients}</p>
              </div>
            </div>
          )}
        </header>

        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              disabled={!systemStatus.isInitialized && tab.id !== "overview"}
            >
              {tab.label}
              {tab.badge && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.id
                    ? "bg-emerald-700 text-emerald-100"
                    : "bg-slate-200 text-slate-600"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && <OverviewTab systemStatus={systemStatus} onInitialize={() => setShowInitModal(true)} />}
          {activeTab === "registration" && <RegistrationModule />}
          {activeTab === "bedManagement" && <BedManagementModule />}
          {activeTab === "facilities" && <FacilitiesModule />}
          {activeTab === "security" && <SecurityModule />}
          {activeTab === "mitosis" && <MitosisModule />}
          {activeTab === "scenarios" && <ScenariosModule />}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({ systemStatus, onInitialize }: { systemStatus: any; onInitialize: () => void }) {
  if (!systemStatus.isInitialized) {
    return (
      <Card>
        <CardHeader title="Welcome to Epic Simulator" subtitle="Getting Started" />
        <div className="mt-6 space-y-4">
          <Alert variant="warning">
            <p className="font-semibold">System Not Initialized</p>
            <p className="mt-1">
              Click the button below to initialize the system with sample data.
            </p>
          </Alert>
          <Button variant="primary" size="lg" onClick={onInitialize}>
            Initialize System Now
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader
          title="Chronicles Data Kernel"
          subtitle="Master Files"
          badge={<Badge variant="success">Active</Badge>}
        />
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="font-semibold text-slate-900">INI Hierarchy</p>
            <p className="text-xs text-slate-600">
              INI → Record → Contact → Item → Value
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-center">
              <p className="text-xs text-emerald-700">Static</p>
              <p className="font-semibold text-emerald-900">
                {systemStatus.counts.facilities + systemStatus.counts.departments + systemStatus.counts.rooms + systemStatus.counts.beds}
              </p>
            </div>
            <div className="rounded-lg bg-sky-50 p-2 text-center">
              <p className="text-xs text-sky-700">Dynamic</p>
              <p className="font-semibold text-sky-900">
                {systemStatus.counts.patients + systemStatus.counts.guarantors}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Training Modules"
          subtitle="Core Features"
          badge={<Badge variant="info">5 Scenarios</Badge>}
        />
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
            <StatusDot status="success" />
            <span>Pediatric Guarantor Trap</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
            <StatusDot status="success" />
            <span>Gender-Aware Bed Logic</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
            <StatusDot status="success" />
            <span>Rule of Specificity</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
            <StatusDot status="success" />
            <span>SEC 900 Security</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
            <StatusDot status="success" />
            <span>Mitosis Reset Engine</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="System Health"
          subtitle="Status"
          badge={<Badge variant="success">Operational</Badge>}
        />
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
            <span className="text-slate-600">Database</span>
            <Badge variant="success" size="sm">Connected</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
            <span className="text-slate-600">Validation Engine</span>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
            <span className="text-slate-600">Facility Inheritance</span>
            <Badge variant="success" size="sm">Enabled</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
