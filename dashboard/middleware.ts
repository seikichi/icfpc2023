// https://github.com/vercel/examples/blob/main/edge-middleware/basic-auth-password/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/", "/index"],
};

const USER = process.env.AUTH_USER || "admin";
const PASSWORD = process.env.AUHT_PASSWORD || "password";

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    if (user === USER && pwd === PASSWORD) {
      return NextResponse.next();
    }
  }
  url.pathname = "/api/auth";

  return NextResponse.rewrite(url);
}
