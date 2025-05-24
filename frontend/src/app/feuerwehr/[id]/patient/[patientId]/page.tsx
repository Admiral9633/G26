import { PatientDetailClient } from "@/components/patient-detail-client";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string; patientId: string }>;
}) {
  const { id, patientId } = await params;
  return <PatientDetailClient feuerwehrId={id} patientId={patientId} />;
}
