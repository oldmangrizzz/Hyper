import { Card, CardHeader, Alert } from "./ui";

export default function BedManagementModule() {
  return (
    <Card>
      <CardHeader title="Grand Central Bed Management" subtitle="BED/ROM Operations" />
      <div className="mt-6">
        <Alert variant="info">
          Bed management module - Full implementation in progress.
        </Alert>
      </div>
    </Card>
  );
}
