import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: interviewId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.member.findFirst({
    where: { userId: user.id },
    include: { organization: { select: { id: true } } },
  });
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify interview belongs to org
  const interview = await db.interview.findFirst({
    where: { id: interviewId, application: { job: { organizationId: member.organization.id } } },
  });
  if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { rubricScores, overallRating, recommendation, notes, aiDrafted } = await request.json();

  const feedback = await db.interviewFeedback.create({
    data: {
      interviewId,
      authorId: user.id,
      rubricScores: rubricScores ?? [],
      overallRating: overallRating ?? 3,
      recommendation: recommendation ?? "MAYBE",
      notes: notes ?? null,
      aiDrafted: aiDrafted ?? false,
    },
  });

  // Mark interview as completed when feedback is submitted
  await db.interview.update({
    where: { id: interviewId },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json(feedback, { status: 201 });
}
