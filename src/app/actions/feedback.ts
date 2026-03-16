"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { FeedbackType } from "@prisma/client";

export async function createFeedback(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as FeedbackType;

  const membership = await db.member.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });

  if (!membership) {
    throw new Error("Organization not found");
  }

  await db.feedback.create({
    data: {
      organizationId: membership.organizationId,
      userId: user.id,
      userEmail: user.email || "",
      type,
      title,
      description,
    },
  });

  revalidatePath("/");
}

export async function upvoteFeedback(feedbackId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const feedback = await db.feedback.findUnique({
    where: { id: feedbackId },
  });

  if (!feedback) {
    throw new Error("Feedback not found");
  }

  if (feedback.voterIds.includes(user.id)) {
    // Already voted
    return;
  }

  await db.feedback.update({
    where: { id: feedbackId },
    data: {
      votes: { increment: 1 },
      voterIds: { push: user.id },
    },
  });

  revalidatePath("/");
}

export async function getFeedbacks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const membership = await db.member.findFirst({
    where: { userId: user.id },
  });

  if (!membership) {
    return [];
  }

  return await db.feedback.findMany({
    where: { organizationId: membership.organizationId },
    orderBy: { createdAt: "desc" },
  });
}
