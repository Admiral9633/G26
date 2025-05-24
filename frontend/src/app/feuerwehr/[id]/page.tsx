import { FeuerwehrDetailClient } from "@/components/feuerwehr-detail-client";

export default async function FeuerwehrDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Warten auf die params, bevor auf ihre Eigenschaften zugegriffen wird
  const { id } = await params;

  return <FeuerwehrDetailClient id={id} />;
}
