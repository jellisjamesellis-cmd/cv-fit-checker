import { NextResponse } from "next/server";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/",
  "/history(.*)",
  "/api/analyze(.*)",
]);

function hasClerkKeys(): boolean {
  return Boolean(
    process.env.CLERK_SECRET_KEY &&
      (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        process.env.CLERK_PUBLISHABLE_KEY)
  );
}

/**
 * Do not call `clerkMiddleware()` at module load — it throws on the Edge
 * runtime when CLERK_SECRET_KEY is missing (MIDDLEWARE_INVOCATION_FAILED).
 * Lazily construct the Clerk handler only when keys are present.
 */
let clerkHandler: NextMiddleware | null = null;

function getClerkHandler(): NextMiddleware {
  if (!clerkHandler) {
    clerkHandler = clerkMiddleware(async (auth, request) => {
      if (isProtectedRoute(request)) {
        await auth.protect();
      }
    });
  }
  return clerkHandler;
}

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  if (!hasClerkKeys()) {
    return NextResponse.next();
  }

  return getClerkHandler()(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
