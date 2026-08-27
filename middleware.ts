import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/",
  "/history(.*)",
  "/api/analyze(.*)",
]);

const hasClerkKeys = Boolean(
  process.env.CLERK_SECRET_KEY &&
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_PUBLISHABLE_KEY)
);

export default clerkMiddleware(async (auth, request) => {
  // Skip auth enforcement when keys are missing so `next build` / misconfigured
  // previews don't crash; the UI shows a setup message instead.
  if (!hasClerkKeys) {
    return;
  }

  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
