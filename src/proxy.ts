import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)"]);
const isPublicApi = createRouteMatcher(["/api/health"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApi(req)) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    // Explicit redirect avoids Clerk protect-rewrite → 404 on Vercel + pk_test
    // when the request has no clerk browser cookie (curl/health probes).
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
