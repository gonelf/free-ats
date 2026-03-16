"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
});

async function getMember() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return await db.member.findFirstOrThrow({
    where: { userId: user.id },
    select: { organizationId: true, role: true },
  });
}

export async function createEmailTemplate(formData: z.infer<typeof templateSchema>) {
  const member = await getMember();
  
  const validated = templateSchema.parse(formData);

  await db.emailTemplate.create({
    data: {
      ...validated,
      organizationId: member.organizationId,
      type: "CUSTOM",
    },
  });

  revalidatePath("/email-templates");
}

export async function updateEmailTemplate(id: string, formData: z.infer<typeof templateSchema>) {
  const member = await getMember();
  
  const validated = templateSchema.parse(formData);

  // Check ownership
  await db.emailTemplate.findFirstOrThrow({
    where: { id, organizationId: member.organizationId },
  });

  await db.emailTemplate.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/email-templates");
}

export async function deleteEmailTemplate(id: string) {
  const member = await getMember();

  // Check ownership and type (don't delete system templates)
  const template = await db.emailTemplate.findFirstOrThrow({
    where: { id, organizationId: member.organizationId },
  });

  if (template.type === "CONFIRMATION") {
    throw new Error("Cannot delete system templates");
  }

  await db.emailTemplate.delete({
    where: { id },
  });

  revalidatePath("/email-templates");
}
