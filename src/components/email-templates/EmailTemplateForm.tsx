"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createEmailTemplate, updateEmailTemplate } from "@/app/actions/email-templates";

interface EmailTemplateFormProps {
  initialData?: {
    id: string;
    name: string;
    subject: string;
    body: string;
  };
}

export function EmailTemplateForm({ initialData }: EmailTemplateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name") as string,
      subject: formData.get("subject") as string,
      body: formData.get("body") as string,
    };

    try {
      if (initialData) {
        await updateEmailTemplate(initialData.id, data);
      } else {
        await createEmailTemplate(data);
      }
      router.push("/email-templates");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Interview Invitation"
              defaultValue={initialData?.name}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Only visible to your team.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="e.g., Next steps: {{job_title}} at {{company_name}}"
              defaultValue={initialData?.subject}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              name="body"
              placeholder="Write your email content here..."
              className="min-h-[300px] font-sans"
              defaultValue={initialData?.body}
              required
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {["candidate_name", "job_title", "company_name"].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {"{{"}{tag}{"}}"}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Use the tags above to personalize your emails.
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
