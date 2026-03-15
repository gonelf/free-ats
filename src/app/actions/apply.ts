"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitApplication(jobId: string, formData: FormData) {
  try {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const linkedinUrl = formData.get("linkedinUrl") as string;
    
    // Get job to find its organization and pipeline
    const job = await db.job.findUnique({
      where: { id: jobId },
      include: { 
        organization: true,
        pipeline: {
          include: {
            stages: {
              orderBy: { order: "asc" },
            }
          }
        }
      },
    });

    if (!job) {
      return { error: "Job not found" };
    }

    const firstStage = job.pipeline.stages[0];
    if (!firstStage) {
      return { error: "No hiring pipeline found for this job" };
    }

    // Upsert candidate within the organization
    const candidate = await db.candidate.upsert({
      where: {
        organizationId_email: {
          organizationId: job.organizationId,
          email,
        }
      },
      update: {
        firstName,
        lastName,
        phone,
        linkedinUrl,
      },
      create: {
        organizationId: job.organizationId,
        firstName,
        lastName,
        email,
        phone,
        linkedinUrl,
      }
    });

    // Create application
    await db.application.upsert({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: candidate.id,
        }
      },
      update: {}, // Don't move if they apply twice for now
      create: {
        jobId,
        candidateId: candidate.id,
        stageId: firstStage.id,
      }
    });

    revalidatePath(`/jobs/${jobId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting application:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
