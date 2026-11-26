import { idSchema } from '@/modules/admin/validation';
import { signedImageUrl } from '@/modules/media/service/media-service';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return new Response('Not found', { status: 404 });
  const url = await signedImageUrl(id);
  if (!url) return new Response('Not found', { status: 404 });
  return new Response(null, {
    status: 307,
    headers: { Location: url, 'Cache-Control': 'private, no-store' },
  });
}
