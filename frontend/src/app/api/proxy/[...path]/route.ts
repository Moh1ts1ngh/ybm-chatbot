import { auth } from "@/auth";
import { serverEnv } from "@/env/server";
import { NextRequest, NextResponse } from "next/server";

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await params;
  const endpoint = path.join("/");
  const url = `${serverEnv.BACKEND_API_URL}/${endpoint}`;

  const headers = new Headers(req.headers);
  headers.set("x-tenant-id", session.user.tenantId);
  headers.set("x-user-id", session.user.id);
  headers.delete("host");
  headers.delete("cookie");

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.blob()
      : undefined;

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });

    const data = await res.blob();
    return new NextResponse(data, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Backend unavailable" },
      { status: 502 }
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE };

