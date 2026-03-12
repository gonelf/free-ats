"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AiButton } from "@/components/ai/AiGate";

interface NewJobFormProps {
  action: (formData: FormData) => Promise<void>;
  isPro: boolean;
  defaultValues?: {
    title?: string;
    description?: string;
    requirements?: string;
    location?: string;
  };
}

export function NewJobForm({ action, isPro, defaultValues }: NewJobFormProps) {
  const [title, setTitle] = useState(defaultValues?.title || "");
  const [description, setDescription] = useState(defaultValues?.description || "");
  const [requirements, setRequirements] = useState(defaultValues?.requirements || "");
  const [location, setLocation] = useState(defaultValues?.location || "");
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [checkingBias, setCheckingBias] = useState(false);
  const [biasResult, setBiasResult] = useState<{ hasBias: boolean; issues: Array<{ text: string; suggestion: string; reason: string }>; score: number } | null>(null);

  async function generateDescription() {
    if (!title) return;
    setGeneratingDescription(true);
    try {
      const res = await fetch("/api/ai/generate-job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, context: location }),
      });
      if (res.ok) {
        const data = await res.json();
        setDescription(data.description);
        setRequirements(data.requirements);
      }
    } finally {
      setGeneratingDescription(false);
    }
  }

  async function checkBias() {
    if (!description && !requirements) return;
    setCheckingBias(true);
    setBiasResult(null);
    try {
      const res = await fetch("/api/ai/check-job-bias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${description}\n${requirements}` }),
      });
      if (res.ok) {
        const data = await res.json();
        setBiasResult(data);
      }
    } finally {
      setCheckingBias(false);
    }
  }

  return (
    <form action={action} className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Job title *</Label>
          <div className="flex gap-2">
            <Input
              id="title"
              name="title"
              placeholder="e.g. Senior Software Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="flex-1"
            />
            <AiButton
              isPro={isPro}
              onClick={generateDescription}
              loading={generatingDescription}
            >
              Generate Description
            </AiButton>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g. San Francisco, CA or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="salaryMin">Salary min (optional)</Label>
            <Input
              id="salaryMin"
              name="salaryMin"
              type="number"
              placeholder="80000"
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="salaryMax">Salary max (optional)</Label>
            <Input
              id="salaryMax"
              name="salaryMax"
              type="number"
              placeholder="120000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Job description *</Label>
            <AiButton
              isPro={isPro}
              onClick={checkBias}
              loading={checkingBias}
            >
              Check for Bias
            </AiButton>
          </div>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe the role, responsibilities, and what success looks like..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            required
          />
        </div>

        {biasResult && (
          <div className={`rounded-lg p-4 ${biasResult.hasBias ? "bg-yellow-50 border border-yellow-200" : "bg-green-50 border border-green-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Inclusivity Score: {biasResult.score}/100
              </span>
              {!biasResult.hasBias && (
                <span className="text-xs text-green-700 font-medium">✓ Looks good!</span>
              )}
            </div>
            {biasResult.issues.map((issue, i) => (
              <div key={i} className="mt-2 text-xs">
                <span className="font-medium text-yellow-800">"{issue.text}"</span>
                <span className="text-yellow-700"> → {issue.suggestion}</span>
                <span className="text-yellow-600 block">{issue.reason}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            name="requirements"
            placeholder="List required skills, experience, and qualifications..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={6}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" name="status" value="DRAFT" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit" name="status" value="OPEN">
          Publish Job
        </Button>
      </div>
    </form>
  );
}
