import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { generateJobDescription } from "@/lib/ai/job-generator";

export async function POST(request: NextRequest) {
  const { title, context } = await request.json();
  return withProPlanGuard(async () => {
    return generateJobDescription(title, context);
  });
}
