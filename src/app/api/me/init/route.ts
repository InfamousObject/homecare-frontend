// src/app/api/me/init/route.ts
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
    const { userId } = await auth(); // ✅ must await
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthenticated" }, { status: 401 });
    }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    `${userId}@example.local`;

  // 1) ensure a default agency exists
  const { data: agency, error: agencyErr } = await supabaseAdmin
    .from("agencies")
    .select("id,name")
    .eq("name", "Demo Agency")
    .maybeSingle();

  let agencyId = agency?.id as string | undefined;

  if (!agencyId) {
    const { data: created, error: createErr } = await supabaseAdmin
      .from("agencies")
      .insert({ name: "Demo Agency" })
      .select("id")
      .single();
    if (createErr) {
      return NextResponse.json({ ok: false, error: createErr.message }, { status: 500 });
    }
    agencyId = created.id;
  }

  // 2) upsert user record
  const { error: upsertUserErr } = await supabaseAdmin
    .from("users")
    .upsert({ id: userId, email }, { onConflict: "id" });

  if (upsertUserErr) {
    return NextResponse.json({ ok: false, error: upsertUserErr.message }, { status: 500 });
  }

  // 3) ensure membership as admin
  const { data: membership, error: membershipErr } = await supabaseAdmin
    .from("user_agency_memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("agency_id", agencyId)
    .maybeSingle();

  if (!membership) {
    const { error: insertMemErr } = await supabaseAdmin
      .from("user_agency_memberships")
      .insert({ user_id: userId, agency_id: agencyId, role: "admin" });

    if (insertMemErr) {
      return NextResponse.json({ ok: false, error: insertMemErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, userId, email, agencyId });
}
