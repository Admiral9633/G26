import { KontaktpersonBearbeitenClient } from "@/components/kontaktperson-bearbeiten-client";

export default async function KontaktpersonBearbeitenPage({
  params,
}: {
  params: { id: string; kontaktId: string };
}) {
  const id = await params.id;
  const kontaktId = await params.kontaktId;

  return (
    <KontaktpersonBearbeitenClient kostentraegerId={id} kontaktId={kontaktId} />
  );
}
