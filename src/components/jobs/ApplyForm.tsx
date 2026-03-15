"use client";

import { useState, useTransition } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitApplication } from "@/app/j/[id]/apply-actions";

interface ApplyFormProps {
  jobId: string;
}

export function ApplyForm({ jobId }: ApplyFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (resumeFile) {
      formData.set("resume", resumeFile);
    }

    startTransition(async () => {
      const result = await submitApplication(jobId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-green-100 p-3 rounded-full mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Sent!</h3>
        <p className="text-gray-600 max-w-sm">
          Thank you for applying. We've received your application and will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <div id="apply-section" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-2xl font-bold text-gray-900">Apply for this position</h2>
        <p className="text-gray-500 mt-1">Please fill in the form below to submit your application.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name *</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Jane"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name *</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              required
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jane.doe@example.com"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/janedoe"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume">Resume (PDF)</Label>
          <div className="mt-1">
            <label
              htmlFor="resume-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                resumeFile 
                  ? "border-green-300 bg-green-50/50" 
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className={`w-8 h-8 mb-3 ${resumeFile ? "text-green-500" : "text-gray-400"}`} />
                <p className="mb-2 text-sm text-gray-700 font-medium">
                  {resumeFile ? resumeFile.name : "Click to upload resume"}
                </p>
                <p className="text-xs text-gray-500">
                  PDF (MAX. 10MB)
                </p>
              </div>
              <input
                id="resume-upload"
                type="file"
                className="hidden"
                accept=".pdf"
                disabled={isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setResumeFile(file);
                }}
              />
            </label>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold" 
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
          <p className="text-center text-xs text-gray-400 mt-4">
            By submitting, you agree to our terms and privacy policy.
          </p>
        </div>
      </form>
    </div>
  );
}
