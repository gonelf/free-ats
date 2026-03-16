import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EmailTemplateForm } from "@/components/email-templates/EmailTemplateForm";

interface EditEmailTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmailTemplatePage({
  params,
}: EditEmailTemplatePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const member = await db.member.findFirstOrThrow({
    where: { userId: user.id },
    select: { organizationId: true },
  });

  const template = await db.emailTemplate.findFirst({
    where: {
      id,
      organizationId: member.organizationId,
    },
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Email Template</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your reusable email template.
        </p>
      </div>

      <EmailTemplateForm initialData={template} />
    </div>
  );
}
