"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

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

    let resumeUrl = null;

    // 2. Handle resume upload if present
    if (resumeFile && resumeFile.size > 0 && resumeFile.name !== "undefined") {
      const supabase = await createClient();
      const fileExt = resumeFile.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${job.organizationId}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, resumeFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // We continue even if upload fails, but we won't have the resume URL
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from("resumes")
          .getPublicUrl(filePath);
        resumeUrl = publicUrl;
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
        resumeUrl: resumeUrl || undefined, // Only update if we have a new one
      },
      create: {
        organizationId: job.organizationId,
        firstName,
        lastName,
        email,
        phone,
        linkedinUrl,
        resumeUrl,
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
        stageId: firstStage.id, // Move back to first stage if reapplying? Or keep as is?
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
