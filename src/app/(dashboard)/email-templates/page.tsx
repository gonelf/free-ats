import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Edit2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { DeleteTemplateButton } from "@/components/email-templates/DeleteTemplateButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";

export default async function EmailTemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    select: { organizationId: true },
  });

  const templates = await db.emailTemplate.findMany({
    where: { organizationId: member.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Email Templates"
        subtitle="Reusable templates for candidate communications"
        action={
          <Link href="/email-templates/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </Link>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
          title="No templates yet"
          description="Create reusable email templates for outreach, rejections, and offers."
          action={
            <Link href="/email-templates/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{t.name}</h3>
                    {t.type === "CONFIRMATION" && (
                      <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-500/20">
                        System
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.subject}</p>
                  {t.type === "CONFIRMATION" && (
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                      Sent automatically when a candidate applies
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/email-templates/${t.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  {t.type !== "CONFIRMATION" && (
                    <DeleteTemplateButton id={t.id} name={t.name} />
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Updated {formatDate(t.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
