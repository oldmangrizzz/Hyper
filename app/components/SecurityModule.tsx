import { Card, CardHeader, Alert } from "./ui";

export default function SecurityModule() {
  return (
    <Card>
      <CardHeader title="Security Classes (SEC 900)" subtitle="ECL Management" />
      <div className="mt-6">
        <Alert variant="info">
          Security module - Full implementation in progress.
        </Alert>
      </div>
    </Card>
  );
}
