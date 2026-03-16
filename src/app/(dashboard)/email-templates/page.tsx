import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Reusable templates for candidate communications
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Mail className="h-10 w-10 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No templates yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Create reusable email templates for outreach, rejections, and offers
          </p>
          <Button>
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{t.name}</h3>
                    {t.type === "CONFIRMATION" && (
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                        System
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{t.subject}</p>
                  {t.type === "CONFIRMATION" && (
                    <p className="text-xs text-indigo-500 mt-1">
                      Sent automatically when a candidate applies
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Use</Button>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Updated {formatDate(t.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
