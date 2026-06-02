import { proxyBackendRequest } from "@/src/lib/backend";

const allowedExactPaths = new Set([
  "auth/register",
  "auth/login",
  "auth/create-admin",
  "users/profile",
  "users",
  "categories",
  "products",
  "cart",
  "orders",
  "orders/my-orders",
  "payments",
]);

const allowedPathPatterns = [
  /^users\/[^/]+$/,
  /^categories\/[^/]+$/,
  /^products\/[^/]+$/,
  /^cart\/[^/]+$/,
  /^orders\/[^/]+$/,
  /^orders\/[^/]+\/status$/,
  /^payments\/[^/]+$/,
  /^payments\/order\/[^/]+$/,
];

function isAllowedPath(path: string) {
  return (
    allowedExactPaths.has(path) ||
    allowedPathPatterns.some((pattern) => pattern.test(path))
  );
}

async function handler(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      path: string[];
    }>;
  }
) {
  const { path } = await params;
  const backendPath = path.join("/");

  if (!isAllowedPath(backendPath)) {
    return Response.json(
      { message: "Endpoint not found" },
      { status: 404 }
    );
  }

  return proxyBackendRequest(request, `/${backendPath}`);
}

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};