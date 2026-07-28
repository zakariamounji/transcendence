import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest): Promise<NextResponse<unknown>> {
  const { pathname } = request.nextUrl
  const store = await cookies()

  const t =
    store.get("__Secure-better-auth.session_token")?.value ??
    store.get("better-auth.session_token")?.value

  if (pathname.startsWith("/auth") && t)
    return NextResponse.redirect(new URL("/", request.url))

  if (!t && !pathname.startsWith("/auth"))
    return NextResponse.redirect(new URL("/auth", request.url))

  return NextResponse.next()
}

export const config = {
  // uploaded avatars are read straight off /avatars, so every picture format is let through,
  // not only the png the favicon needed
  matcher: "/((?!api|terms-of-service|privacy-policy|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|webp|gif|svg)$).*)"
}