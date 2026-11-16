import RsvpClient from './RsvpClient';

export const instant = false;

export default async function PublicRsvpPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <RsvpClient token={token} />;
}