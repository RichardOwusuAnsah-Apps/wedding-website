import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { PROGRAMS, isProgramOpen, type Program } from "@/lib/programs";

/**
 * Next 16 Proxy (formerly middleware). Two jobs:
 *
 *  - guards the /admin area: unauthenticated users are sent to /admin/login,
 *    and a logged-in user hitting the login page is sent on to /admin;
 *  - holds the program documents closed until each ceremony's moment.
 *
 * The programs are static files under public/, and the proxy runs before
 * filesystem routes, so this is the only place that can gate them. Both the
 * clean url and the file path behind it are matched, so neither is a way in.
 *
 * The admin layout also re-checks auth server-side — defense in depth, per
 * Supabase guidance.
 */

function supabaseFor(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  return { supabase, response: () => response };
}

/** The program this request is trying to reach, if any. */
function programFor(pathname: string): Program | undefined {
  return PROGRAMS.find(
    (p) => pathname === `/${p.slug}` || p.files.includes(pathname),
  );
}

async function guardProgram(request: NextRequest, program: Program) {
  // Open to everyone — no auth call, so a guest reading the program during
  // the ceremony never waits on Supabase.
  if (isProgramOpen(program)) return NextResponse.next({ request });

  // Fail closed. If the auth check cannot be made — Supabase unreachable, a
  // missing key — a guest sees the holding page rather than a 500, and the
  // program still cannot leak early.
  try {
    const { supabase, response } = supabaseFor(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return response();
  } catch {
    // fall through to the holding page
  }

  // Rewrite, not redirect: the guest keeps the url they scanned or tapped, so
  // a reload at the right time shows the program itself.
  const url = request.nextUrl.clone();
  url.pathname = `/program-soon/${program.slug}`;
  url.search = "";
  const held = NextResponse.rewrite(url);
  // Never let a cache hold on to "not yet" past the moment it stops being true.
  held.headers.set("Cache-Control", "no-store, must-revalidate");
  return held;
}

async function guardAdmin(request: NextRequest) {
  const { supabase, response } = supabaseFor(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  return response();
}

export async function proxy(request: NextRequest) {
  const program = programFor(request.nextUrl.pathname);
  if (program) return guardProgram(request, program);
  return guardAdmin(request);
}

export const config = {
  // Constants only — matchers are read at build time, so these cannot be
  // derived from PROGRAMS. Keep them in step with the slugs and files there.
  matcher: [
    "/admin/:path*",
    "/trad-program",
    "/trad-program/index.html",
    "/wedding-program",
    "/wedding-program/index.html",
    "/reception-program-and-menu",
    "/reception-program-and-menu/index.html",
  ],
};
