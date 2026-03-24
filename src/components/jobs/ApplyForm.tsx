"use client";

import { useState, useTransition } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitApplication } from "@/app/actions/apply";

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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-12 flex flex-col items-center justify-center text-center border-b border-gray-100">
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 animate-in slide-in-from-bottom-4 duration-700 delay-200">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
            Application Sent!
          </h3>
          <p className="text-gray-600 max-w-sm text-lg animate-in fade-in slide-in-from-bottom-2 duration-700 delay-400">
            Thank you for applying. We&apos;ve received your application for this position.
          </p>
        </div>
        
        <div className="p-8 bg-white space-y-8 animate-in fade-in duration-700 delay-500">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">What happens next?</h4>
            <div className="space-y-6">
              {[
                {
                  title: "Review Process",
                  desc: "Our hiring team will review your resume and qualifications.",
                  icon: "1"
                },
                {
                  title: "Initial Screening",
                  desc: "If there's a match, we'll reach out for an initial conversation.",
                  icon: "2"
                },
                {
                  title: "Interview Rounds",
                  desc: "Selected candidates will be invited for more detailed interviews.",
                  icon: "3"
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-100">
                    {step.icon}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{step.title}</h5>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-semibold border-2 hover:bg-gray-50 transition-all"
              onClick={() => setSubmitted(false)}
            >
              Submit another application
            </Button>
            <p className="text-center text-xs text-gray-400 mt-6">
              A confirmation email has been sent to your inbox.
            </p>
          </div>
        </div>
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

        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <Clock className="h-4 w-4 shrink-0 mt-0.5" />
          <p>Uploaded resumes are automatically deleted after 10 days.</p>
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
