import { NextRequest, NextResponse } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { parseNaturalLanguageQuery, scoreCandidateForSourcing } from "@/lib/ai/sourcing";
import { db } from "@/lib/db";

type WorkExperience = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

export async function POST(request: NextRequest) {
  const { query } = await request.json();
  if (!query?.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  return withProPlanGuard(async (orgId) => {
    // Step 1: Parse natural language query into structured criteria
    const criteria = await parseNaturalLanguageQuery(query);

    // Step 2: Pre-filter candidates by skills/tags using DB
    const skillFilter = criteria.skills.length > 0
      ? criteria.skills.map((s) => s.toLowerCase())
      : [];

    const candidates = await db.candidate.findMany({
      where: {
        organizationId: orgId,
        ...(skillFilter.length > 0 && {
          tags: { hasSome: skillFilter },
        }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        tags: true,
        summary: true,
        workExperience: true,
        linkedinUrl: true,
      },
      take: 50, // pre-filter limit before AI scoring
    });

    if (candidates.length === 0) {
      return NextResponse.json({ criteria, results: [] });
    }

    // Step 3: Score each candidate using AI (batch with limited concurrency)
    const BATCH_SIZE = 5;
    const results = [];

    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      const batch = candidates.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((c) =>
          scoreCandidateForSourcing(criteria, {
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            summary: c.summary,
            tags: c.tags,
            workExperience: (c.workExperience as WorkExperience[] | null) ?? [],
          })
        )
      );
      results.push(...batchResults);
    }

    // Step 4: Sort by match score and attach candidate details
    const scored = results
      .map((r) => {
        const c = candidates.find((c) => c.id === r.candidateId)!;
        return {
          ...r,
          candidate: {
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            tags: c.tags,
            linkedinUrl: c.linkedinUrl,
          },
        };
      })
      .filter((r) => r.matchScore >= 40) // filter out poor matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20); // return top 20

    return NextResponse.json({ criteria, results: scored });
  }, 5);
}
