"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import {
  Card,
  CardHeader,
  Alert,
  Button,
  Input,
  Select,
  ValidationBadge,
  Badge,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
} from "./ui";
import { Id } from "../../convex/_generated/dataModel";

export default function RegistrationModule() {
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [showCreateGuarantor, setShowCreateGuarantor] = useState(false);

  // Query patients and guarantors
  const patients = useQuery(api.crud.listPatients, { includeTemplates: true });
  const guarantors = useQuery(api.crud.listGuarantors, {});

  const selectedPatient = selectedPatientId ? 
    useQuery(api.crud.getPatient, { patientId: selectedPatientId }) : null;

  const validationResults = selectedPatientId ?
    useQuery(api.validation.validatePatientRegistration, { patientId: selectedPatientId }) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Patient List */}
      <Card className="lg:col-span-2">
        <CardHeader
          title="Patient List"
          subtitle="EPT Records"
          badge={
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowCreateGuarantor(true)}>
                + Guarantor
              </Button>
              <Button size="sm" onClick={() => setShowCreatePatient(true)}>
                + Patient
              </Button>
            </div>
          }
        />
        <div className="mt-4">
          {patients === undefined && <p className="text-sm text-slate-500">Loading...</p>}
          {patients && patients.length === 0 && (
            <Alert variant="info">
              No patients found. Create a patient to get started.
            </Alert>
          )}
          {patients && patients.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeadCell>MRN</TableHeadCell>
                  <TableHeadCell>Name</TableHeadCell>
                  <TableHeadCell>DOB / Age</TableHeadCell>
                  <TableHeadCell>Sex</TableHeadCell>
                  <TableHeadCell>Guarantor</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => {
                  const age = calculateAge(patient.dateOfBirth);
                  const isPediatric = age < 18;
                  return (
                    <TableRow
                      key={patient._id}
                      onClick={() => setSelectedPatientId(patient._id)}
                      className={selectedPatientId === patient._id ? "bg-emerald-50" : ""}
                    >
                      <TableCell>{patient.mrn}</TableCell>
                      <TableCell>
                        <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                        {patient.isTemplate && (
                          <Badge size="sm" variant="default">Template</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>{patient.dateOfBirth}</div>
                        <div className="text-xs text-slate-500">
                          Age {age} {isPediatric && "(Pediatric)"}
                        </div>
                      </TableCell>
                      <TableCell>{patient.sex}</TableCell>
                      <TableCell>
                        {patient.guarantorId ? (
                          <Badge size="sm" variant="success">{patient.guarantorId}</Badge>
                        ) : (
                          <Badge size="sm" variant="error">Missing</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {/* Validation status will be shown here */}
                        <Badge size="sm" variant="default">Active</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Patient Details & Validation */}
      <Card>
        <CardHeader title="Patient Details" subtitle="Validation Status" />
        {!selectedPatient && (
          <div className="mt-4">
            <Alert variant="info">
              Select a patient from the list to view details and validation status.
            </Alert>
          </div>
        )}
        {selectedPatient && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">MRN:</dt>
                  <dd className="font-medium">{selectedPatient.mrn}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">DOB:</dt>
                  <dd className="font-medium">{selectedPatient.dateOfBirth}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Age:</dt>
                  <dd className="font-medium">{calculateAge(selectedPatient.dateOfBirth)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Sex:</dt>
                  <dd className="font-medium">{selectedPatient.sex}</dd>
                </div>
              </dl>
            </div>

            {/* Validation Results */}
            {validationResults && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Validation Status</h4>
                  {validationResults.isValid ? (
                    <Badge variant="success">Valid</Badge>
                  ) : (
                    <Badge variant="error">Invalid</Badge>
                  )}
                </div>

                {validationResults.validations.length === 0 && (
                  <Alert variant="success">
                    All validation checks passed. Ready for registration.
                  </Alert>
                )}

                {validationResults.validations.map((validation, idx) => (
                  <Alert
                    key={idx}
                    variant={
                      validation.severity === "HardStop" ? "error" :
                      validation.severity === "SoftStop" ? "warning" : "info"
                    }
                    title={validation.code}
                  >
                    {validation.message}
                  </Alert>
                ))}

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    disabled={validationResults.summary.hardStops > 0}
                    className="flex-1"
                  >
                    {validationResults.summary.hardStops > 0 ? "Blocked by Hard Stops" : "Finish Registration"}
                  </Button>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-700">Validation Summary</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-slate-500">Hard Stops</p>
                      <p className="text-lg font-semibold text-rose-700">
                        {validationResults.summary.hardStops}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Soft Stops</p>
                      <p className="text-lg font-semibold text-amber-700">
                        {validationResults.summary.softStops}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Warnings</p>
                      <p className="text-lg font-semibold text-sky-700">
                        {validationResults.summary.warnings}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Create Patient Modal */}
      <CreatePatientModal
        isOpen={showCreatePatient}
        onClose={() => setShowCreatePatient(false)}
        guarantors={guarantors || []}
      />

      {/* Create Guarantor Modal */}
      <CreateGuarantorModal
        isOpen={showCreateGuarantor}
        onClose={() => setShowCreateGuarantor(false)}
      />
    </div>
  );
}

// Helper function to calculate age
function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(age, 0);
}

// Create Patient Modal Component
function CreatePatientModal({ isOpen, onClose, guarantors }: any) {
  const [formData, setFormData] = useState({
    mrn: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "Male",
    guarantorId: "",
  });

  const createPatient = useMutation(api.crud.createPatient);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPatient({
        eptId: `EPT-${Date.now()}`,
        mrn: formData.mrn,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
        guarantorId: formData.guarantorId || undefined,
      });
      onClose();
      // Reset form
      setFormData({
        mrn: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        sex: "Male",
        guarantorId: "",
      });
    } catch (error) {
      alert("Failed to create patient: " + error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Patient (EPT)"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Create Patient</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Medical Record Number (MRN)"
          value={formData.mrn}
          onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
          placeholder="MRN-12345"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
        <Input
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          required
        />
        <Select
          label="Sex"
          value={formData.sex}
          onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
        />
        <Select
          label="Guarantor (EAR)"
          value={formData.guarantorId}
          onChange={(e) => setFormData({ ...formData, guarantorId: e.target.value })}
          options={[
            { value: "", label: "-- Select Guarantor --" },
            ...guarantors.map((g: any) => ({
              value: g.earId,
              label: `${g.name} (${g.earId})`,
            })),
          ]}
        />
      </form>
    </Modal>
  );
}

// Create Guarantor Modal Component
function CreateGuarantorModal({ isOpen, onClose }: any) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const createGuarantor = useMutation(api.crud.createGuarantor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGuarantor({
        earId: `EAR-${Date.now()}`,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      });
      onClose();
      // Reset form
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        zip: "",
      });
    } catch (error) {
      alert("Failed to create guarantor: " + error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Guarantor (EAR)"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Create Guarantor</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Guarantor Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="col-span-2"
          />
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            maxLength={2}
          />
        </div>
        <Input
          label="ZIP Code"
          value={formData.zip}
          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
        />
      </form>
    </Modal>
  );
}
