import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GATE_COOKIE, isValidGateToken } from "@/lib/gate/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(GATE_COOKIE)?.value;
  const authenticated = await isValidGateToken(token);

  if (pathname === "/gate") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (authenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/gate", request.url);
  if (pathname !== "/") {
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
      Protect app pages and APIs.
      Leave static assets, Next internals, and the gate endpoints open.
    */
    "/((?!gate|api/gate|_next/static|_next/image|favicon.ico|icon.svg|icon.png|apple-icon.png|apple-touch-icon.png|og-image.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
