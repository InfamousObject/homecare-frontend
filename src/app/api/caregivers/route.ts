// src/app/api/caregivers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireCurrentAgency } from "@/lib/agency";

export async function GET() {
  try {
    const { agencyId } = await requireCurrentAgency();

    const { data, error } = await supabaseAdmin
      .from("caregivers")
      .select(
        "id, first_name, last_name, email, phone, status, max_weekly_hours, preferred_hours_per_week"
      )
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, caregivers: data ?? [] });
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    const status = msg === "Unauthenticated" ? 401 : 400;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agencyId } = await requireCurrentAgency();

    const payload = {
      agency_id: agencyId,
      first_name: body.firstName ?? null,
      last_name: body.lastName ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      max_weekly_hours: body.maxWeeklyHours ?? null,
      preferred_hours_per_week: body.preferredHoursPerWeek ?? null,
      status: "active" as const,
    };

    const { data, error } = await supabaseAdmin
      .from("caregivers")
      .insert(payload)
      .select(
        "id, first_name, last_name, email, phone, status, max_weekly_hours, preferred_hours_per_week"
      )
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, caregiver: data }, { status: 201 });
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    const status = msg === "Unauthenticated" ? 401 : 400;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
