import { FeuerwehrEditClient } from "@/components/feuerwehr-edit-client";

export default async function FeuerwehrEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FeuerwehrEditClient id={id} />;
}
