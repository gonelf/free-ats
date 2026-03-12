import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { parseResume } from "@/lib/ai/resume-parser";

export async function POST(request: NextRequest) {
  const { resumeText } = await request.json();
  return withProPlanGuard(async () => {
    return parseResume(resumeText);
  });
}
