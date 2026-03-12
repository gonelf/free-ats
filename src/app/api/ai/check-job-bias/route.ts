import { NextRequest } from "next/server";
import { withProPlanGuard } from "@/lib/ai/api-helpers";
import { checkJobBias } from "@/lib/ai/job-generator";

export async function POST(request: NextRequest) {
  const { text } = await request.json();
  return withProPlanGuard(async () => {
    return checkJobBias(text);
  });
}
