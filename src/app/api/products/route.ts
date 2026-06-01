import { proxyBackendRequest } from "@/src/lib/backend";

function handler(request: Request) {
  return proxyBackendRequest(
    request,
    "/products"
  );
}

export {
  handler as GET,
  handler as POST,
};
