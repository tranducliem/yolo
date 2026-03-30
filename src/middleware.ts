import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Protected paths — uncomment redirect block below when real auth is active
// const PROTECTED_PATHS = [
//   "/home", "/post", "/mypage", "/settings",
//   "/cart", "/checkout", "/orders", "/notifications", "/order-complete",
// ];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — this is the key operation for SSR auth
  await supabase.auth.getUser();

  // Redirect unauthenticated users from protected routes
  // NOTE: Disabled until P1-005 (useAuth refactor) replaces localStorage mock auth.
  // Once real Supabase Auth is active, uncomment this block.
  // if (
  //   !user &&
  //   PROTECTED_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))
  // ) {
  //   const redirectUrl = request.nextUrl.clone();
  //   redirectUrl.pathname = "/signup";
  //   return NextResponse.redirect(redirectUrl);
  // }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/stripe|test/).*)"],
};
