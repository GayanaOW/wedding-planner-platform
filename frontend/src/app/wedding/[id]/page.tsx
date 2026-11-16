import WorkspaceClient from './WorkspaceClient';

export const instant = false;

export default async function WeddingWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkspaceClient weddingId={id} />;
}