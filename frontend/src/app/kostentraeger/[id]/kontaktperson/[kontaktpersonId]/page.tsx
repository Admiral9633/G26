import { KontaktpersonBearbeitenClient } from "@/components/kontaktperson-bearbeiten-client";

export default async function KontaktpersonBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string; kontaktpersonId: string }>;
}) {
  const { id, kontaktpersonId } = await params;
  return (
    <KontaktpersonBearbeitenClient
      kostentraegerId={id}
      kontaktpersonId={kontaktpersonId}
    />
  );
}
