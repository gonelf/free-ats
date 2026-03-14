import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { suggestSalaryRange } from "@/lib/ai/job-generator";

export async function POST(request: NextRequest) {
  const { title, location, seniority } = await request.json();
  return withProPlanGuard(async () => {
    return suggestSalaryRange(title, location, seniority);
  }, 3);
}
