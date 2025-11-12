"use client";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn, user } = useUser();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">HomeCare Scheduling — Dev</h1>
      {!isSignedIn ? (
        <div className="mt-4">
          <SignInButton>Sign in</SignInButton>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <div>
            Signed in as:{" "}
            <b>{user?.fullName || user?.primaryEmailAddress?.emailAddress}</b>
          </div>
          <SignOutButton />
        </div>
      )}
      <p className="mt-6 text-sm text-gray-600">
        Day-1 check: you can sign in and see your identity here.
      </p>
    </main>
  );
}

