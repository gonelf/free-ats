"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { uploadResumeToR2, freeResumeExpiresAt } from "@/lib/r2";

export async function submitApplication(jobId: string, formData: FormData) {
  try {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string | null;
    const linkedinUrl = formData.get("linkedinUrl") as string | null;
    const resumeFile = formData.get("resume") as File | null;

    if (!firstName || !lastName || !email) {
      return { error: "Missing required fields" };
    }

    // 1. Get job and organization
    const job = await db.job.findUnique({
      where: { id: jobId },
      include: {
        organization: true,
        pipeline: {
          include: {
            stages: {
              orderBy: { order: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!job) {
      return { error: "Job not found" };
    }

    const firstStage = job.pipeline.stages[0];
    if (!firstStage) {
      return { error: "Job pipeline not configured" };
    }

    let resumeUrl: string | null = null;
    let resumeExpiresAt: Date | null = null;

    // 2. Handle resume upload to R2
    if (resumeFile && resumeFile.size > 0 && resumeFile.name !== "undefined") {
      try {
        resumeUrl = await uploadResumeToR2(resumeFile, job.organizationId);
        // Free plan resumes expire in 10 days
        if (job.organization.plan === "FREE") {
          resumeExpiresAt = freeResumeExpiresAt();
        }
      } catch (uploadError) {
        console.error("R2 upload error:", uploadError);
        // Continue without resume rather than blocking the application
      }
    }

    // 3. Create or update Candidate
    const candidate = await db.candidate.upsert({
      where: {
        organizationId_email: {
          organizationId: job.organizationId,
          email: email,
        },
      },
      update: {
        firstName,
        lastName,
        phone,
        linkedinUrl,
        ...(resumeUrl && { resumeUrl, resumeExpiresAt }),
      },
      create: {
        organizationId: job.organizationId,
        firstName,
        lastName,
        email,
        phone,
        linkedinUrl,
        resumeUrl,
        resumeExpiresAt,
      },
    });

    // 4. Create Application
    await db.application.upsert({
      where: {
        jobId_candidateId: {
          jobId: job.id,
          candidateId: candidate.id,
        },
      },
      update: {
        stageId: firstStage.id,
      },
      create: {
        jobId: job.id,
        candidateId: candidate.id,
        stageId: firstStage.id,
      },
    });

    revalidatePath(`/j/${jobId}`);
    return { success: true };
  } catch (error) {
    console.error("Application submission error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
}
