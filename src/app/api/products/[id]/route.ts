import { proxyBackendRequest } from "@/src/lib/backend";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const { id } = await params;

  return proxyBackendRequest(
    request,
    `/products/${encodeURIComponent(id)}`
  );
}

export {
  GET as DELETE,
  GET as PUT,
};
