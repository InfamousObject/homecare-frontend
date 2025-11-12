// src/lib/agency.ts
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabaseAdmin";

export async function requireCurrentAgency() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const { data, error } = await supabaseAdmin
    .from("user_agency_memberships")
    .select("agency_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("No agency membership found for current user");
  }

  return { userId, agencyId: data.agency_id as string };
}
