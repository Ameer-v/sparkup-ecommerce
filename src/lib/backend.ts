const backendBaseUrl =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL;

function getBackendUrl(path: string) {
  if (!backendBaseUrl) {
    throw new Error(
      "API_URL or NEXT_PUBLIC_API_URL is not configured"
    );
  }

  return new URL(path, backendBaseUrl);
}

function getForwardedHeaders(
  request: Request
) {
  const headers = new Headers();

  const forwardedHeaderNames = [
    "accept",
    "authorization",
    "content-type",
  ];

  forwardedHeaderNames.forEach(
    (headerName) => {
      const value =
        request.headers.get(headerName);

      if (value) {
        headers.set(headerName, value);
      }
    }
  );

  return headers;
}

async function getRequestBody(
  request: Request
) {
  if (
    request.method === "GET" ||
    request.method === "HEAD"
  ) {
    return undefined;
  }

  const body =
    await request.arrayBuffer();

  if (body.byteLength === 0) {
    return undefined;
  }

  return body;
}

function getResponseHeaders(
  response: Response
) {
  const headers = new Headers();
  const contentType =
    response.headers.get(
      "content-type"
    );

  if (contentType) {
    headers.set(
      "Content-Type",
      contentType
    );
  }

  return headers;
}

export async function proxyBackendRequest(
  requestOrPath: Request | string,
  path?: string
) {
  try {
    const request =
      typeof requestOrPath === "string"
        ? null
        : requestOrPath;

    const backendPath =
      typeof requestOrPath === "string"
        ? requestOrPath
        : path;

    if (!backendPath) {
      return Response.json(
        {
          message:
            "Backend path is required",
        },
        {
          status: 500,
        }
      );
    }

    const url =
      getBackendUrl(backendPath);

    if (request) {
      url.search = new URL(
        request.url
      ).search;
    }

    const response = await fetch(
      url,
      {
        method:
          request?.method ?? "GET",
        headers: request
          ? getForwardedHeaders(request)
          : undefined,
        body: request
          ? await getRequestBody(request)
          : undefined,
        cache: "no-store",
      }
    );

    return new Response(
      await response.text(),
      {
        status: response.status,
        statusText: response.statusText,
        headers:
          getResponseHeaders(response),
      }
    );
  } catch (error) {
    console.error(
      "Failed to connect to backend",
      error
    );

    return Response.json(
      {
        message:
          "Failed to connect to backend",
      },
      {
        status: 500,
      }
    );
  }
}
