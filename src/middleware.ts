// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

// Export as a named function instead of a default anonymous function
export const middleware = clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
