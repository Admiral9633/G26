import { DashboardLayout } from "@/components/dashboard-layout";
import { UntersuchungPdfClient } from "@/components/untersuchung-pdf-client";

export default async function UntersuchungPdfPage({
  params,
}: {
  params: Promise<{ id: string; patientId: string; untersuchungId: string }>;
}) {
  const { id, patientId, untersuchungId } = await params;

  return (
    <DashboardLayout>
      <UntersuchungPdfClient
        feuerwehrId={id}
        patientId={patientId}
        untersuchungId={untersuchungId}
      />
    </DashboardLayout>
  );
}
