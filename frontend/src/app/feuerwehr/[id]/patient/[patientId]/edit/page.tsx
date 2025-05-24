import { PatientEditClient } from "@/components/patient-edit-client";

export default async function PatientEditPage({
  params,
}: {
  params: Promise<{ id: string; patientId: string }>;
}) {
  const { id, patientId } = await params;
  return <PatientEditClient feuerwehrId={id} patientId={patientId} />;
}
