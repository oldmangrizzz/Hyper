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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
  StatusDot,
  Select,
} from "./ui";
import { Id } from "../../convex/_generated/dataModel";

export default function BedManagementModule() {
  const [selectedRoomId, setSelectedRoomId] = useState<Id<"rooms"> | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBedForAssignment, setSelectedBedForAssignment] = useState<Id<"beds"> | null>(null);

  // Query all rooms, beds, and patients
  const rooms = useQuery(api.crud.listRooms, {});
  const beds = useQuery(api.crud.listBeds, {});
  const patients = useQuery(api.crud.listPatients, { includeTemplates: true });

  // Get room details if selected
  const roomBedStatus = selectedRoomId ?
    useQuery(api.bedManagement.getRoomBedStatus, { roomId: selectedRoomId }) : null;

  // Bed status counts
  const bedStats = beds ? {
    total: beds.length,
    available: beds.filter(b => b.status === "Available").length,
    occupied: beds.filter(b => b.status === "Occupied").length,
    housekeeping: beds.filter(b => b.status === "Housekeeping").length,
  } : null;

  const handleAssignBed = (bedId: Id<"beds">) => {
    setSelectedBedForAssignment(bedId);
    setShowAssignModal(true);
  };

  const handleReleaseBed = useMutation(api.bedManagement.releasePatientFromBed);

  const onRelease = async (bedId: Id<"beds">) => {
    if (confirm("Release this patient from the bed and mark for housekeeping?")) {
      try {
        await handleReleaseBed({ bedId });
      } catch (error) {
        alert("Failed to release bed: " + error);
      }
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Bed Census Overview */}
      <Card className="lg:col-span-2">
        <CardHeader
          title="Bed Census"
          subtitle="All Rooms & Beds"
          badge={
            bedStats && (
              <div className="flex gap-2">
                <Badge variant="success">{bedStats.available} Available</Badge>
                <Badge variant="error">{bedStats.occupied} Occupied</Badge>
                <Badge variant="warning">{bedStats.housekeeping} Cleaning</Badge>
              </div>
            )
          }
        />
        <div className="mt-4 space-y-4">
          {rooms === undefined && <p className="text-sm text-slate-500">Loading...</p>}
          {rooms && rooms.length === 0 && (
            <Alert variant="info">No rooms configured. System needs initialization.</Alert>
          )}
          {rooms && rooms.map((room) => {
            const roomBeds = beds?.filter(b => b.roomId === room._id) || [];
            return (
              <div
                key={room._id}
                className="cursor-pointer rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
                onClick={() => setSelectedRoomId(room._id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{room.name}</h3>
                    <p className="text-xs text-slate-500">
                      {room.romId} • {room.privacyLevel || "N/A"}
                      {room.genderRestriction && room.genderRestriction !== "None" && (
                        <span className="ml-2">• {room.genderRestriction}-only</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {roomBeds.map(bed => (
                      <div key={bed._id} className="text-center">
                        <StatusDot
                          status={
                            bed.status === "Available" ? "success" :
                            bed.status === "Occupied" ? "error" : "warning"
                          }
                          pulse={bed.status === "Housekeeping"}
                        />
                        <p className="mt-1 text-xs text-slate-600">{bed.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Room Details */}
      <Card>
        <CardHeader title="Room Details" subtitle="Bed Status" />
        {!roomBedStatus && (
          <div className="mt-4">
            <Alert variant="info">Select a room to view bed details and assign patients.</Alert>
          </div>
        )}
        {roomBedStatus && !("error" in roomBedStatus) && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">{roomBedStatus.room.name}</h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Room ID:</dt>
                  <dd className="font-medium">{roomBedStatus.room.romId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Privacy:</dt>
                  <dd className="font-medium">{roomBedStatus.room.privacyLevel}</dd>
                </div>
                {roomBedStatus.room.genderRestriction && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Gender:</dt>
                    <dd className="font-medium">
                      <Badge size="sm" variant="info">
                        {roomBedStatus.room.genderRestriction}
                      </Badge>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Beds</h4>
              <div className="space-y-2">
                {roomBedStatus.beds.map(({ bed, patient }) => (
                  <div key={bed._id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusDot
                          status={
                            bed.status === "Available" ? "success" :
                            bed.status === "Occupied" ? "error" : "warning"
                          }
                        />
                        <div>
                          <p className="font-medium text-slate-900">{bed.name}</p>
                          <p className="text-xs text-slate-500">{bed.bedId}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          bed.status === "Available" ? "success" :
                          bed.status === "Occupied" ? "error" : "warning"
                        }
                        size="sm"
                      >
                        {bed.status}
                      </Badge>
                    </div>
                    {patient && (
                      <div className="mt-2 rounded bg-slate-50 p-2 text-xs">
                        <p className="font-medium text-slate-700">{patient.name}</p>
                        <p className="text-slate-500">{patient.mrn} • {patient.sex}</p>
                      </div>
                    )}
                    {bed.genderRestriction && bed.genderRestriction !== "None" && (
                      <p className="mt-1 text-xs text-slate-500">
                        Gender: {bed.genderRestriction}-only
                      </p>
                    )}
                    <div className="mt-2 flex gap-2">
                      {bed.status === "Available" && (
                        <Button size="sm" variant="primary" onClick={() => handleAssignBed(bed._id)}>
                          Assign Patient
                        </Button>
                      )}
                      {bed.status === "Occupied" && (
                        <Button size="sm" variant="danger" onClick={() => onRelease(bed._id)}>
                          Release
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bed Summary */}
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-700">Bed Summary</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-slate-500">Available</p>
                  <p className="text-lg font-semibold text-emerald-700">
                    {roomBedStatus.summary.available}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Occupied</p>
                  <p className="text-lg font-semibold text-rose-700">
                    {roomBedStatus.summary.occupied}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cleaning</p>
                  <p className="text-lg font-semibold text-amber-700">
                    {roomBedStatus.summary.housekeeping}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Assign Patient Modal */}
      {selectedBedForAssignment && (
        <AssignPatientModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedBedForAssignment(null);
          }}
          bedId={selectedBedForAssignment}
          patients={patients || []}
        />
      )}
    </div>
  );
}

// Assign Patient Modal Component
function AssignPatientModal({ isOpen, onClose, bedId, patients }: any) {
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);
  
  const assignPatient = useMutation(api.bedManagement.assignPatientToBed);
  const validation = selectedPatientId ?
    useQuery(api.bedManagement.validateBedAssignment, {
      bedId,
      patientId: selectedPatientId,
    }) : null;

  const handleAssign = async () => {
    if (!selectedPatientId) return;
    
    try {
      await assignPatient({ bedId, patientId: selectedPatientId });
      onClose();
    } catch (error) {
      alert("Failed to assign patient: " + error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Patient to Bed"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            disabled={!selectedPatientId || (validation && !validation.isValid)}
          >
            Assign Patient
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Select Patient"
          value={selectedPatientId || ""}
          onChange={(e) => setSelectedPatientId(e.target.value as Id<"patients">)}
          options={[
            { value: "", label: "-- Select Patient --" },
            ...patients.map((p: any) => ({
              value: p._id,
              label: `${p.firstName} ${p.lastName} (${p.sex}, MRN: ${p.mrn})`,
            })),
          ]}
        />

        {validation && (
          <div>
            {validation.isValid ? (
              <Alert variant="success" title="Validation Passed">
                {validation.message}
              </Alert>
            ) : (
              <Alert variant="error" title={validation.code}>
                {validation.message}
              </Alert>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
