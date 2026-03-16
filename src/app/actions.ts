"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

// Helper to get current user's org
async function getUserOrg() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const member = await db.member.findFirstOrThrow({
    where: { userId: user.id },
    include: { organization: true },
  });

  return { user, org: member.organization, member };
}

// Helper to generate unique slug for a job within an organization
async function generateUniqueJobSlug(organizationId: string, title: string, excludeJobId?: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await db.job.findFirst({
      where: {
        organizationId,
        slug,
        id: excludeJobId ? { not: excludeJobId } : undefined,
      },
    });
    
    if (!existing) return slug;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ============ JOBS ============

export async function createJob(formData: FormData) {
  const { org } = await getUserOrg();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const location = formData.get("location") as string;
  const salaryMin = formData.get("salaryMin")
    ? parseInt(formData.get("salaryMin") as string)
    : null;
  const salaryMax = formData.get("salaryMax")
    ? parseInt(formData.get("salaryMax") as string)
    : null;

  // Get default pipeline
  const pipeline = await db.pipeline.findFirstOrThrow({
    where: { organizationId: org.id, isDefault: true },
  });

  const job = await db.job.create({
    data: {
      organizationId: org.id,
      title,
      description,
      requirements,
      location,
      salaryMin,
      salaryMax,
      slug: await generateUniqueJobSlug(org.id, title),
      pipelineId: pipeline.id,
    },
  });

  revalidatePath("/jobs");
  redirect(`/jobs/${job.id}`);
}

export async function updateJob(jobId: string, formData: FormData) {
  const { org } = await getUserOrg();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const location = formData.get("location") as string;
  const status = formData.get("status") as "DRAFT" | "OPEN" | "CLOSED";

  const existingJob = await db.job.findUniqueOrThrow({
    where: { id: jobId, organizationId: org.id },
  });

  const slug = title !== existingJob.title 
    ? await generateUniqueJobSlug(org.id, title, jobId)
    : existingJob.slug || await generateUniqueJobSlug(org.id, title, jobId);

  await db.job.update({
    where: { id: jobId, organizationId: org.id },
    data: { 
      title, 
      description, 
      requirements, 
      location, 
      status,
      slug
    },
  });

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
}

export async function deleteJob(jobId: string) {
  const { org } = await getUserOrg();
  await db.job.delete({ where: { id: jobId, organizationId: org.id } });
  revalidatePath("/jobs");
  redirect("/jobs");
}

// ============ CANDIDATES ============

export async function createCandidate(formData: FormData) {
  const { org } = await getUserOrg();

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const linkedinUrl = (formData.get("linkedinUrl") as string) || null;

  const candidate = await db.candidate.create({
    data: {
      organizationId: org.id,
      firstName,
      lastName,
      email,
      phone,
      linkedinUrl,
    },
  });

  revalidatePath("/candidates");
  redirect(`/candidates/${candidate.id}`);
}

export async function updateCandidate(candidateId: string, formData: FormData) {
  const { org } = await getUserOrg();

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const linkedinUrl = (formData.get("linkedinUrl") as string) || null;

  await db.candidate.update({
    where: { id: candidateId, organizationId: org.id },
    data: { firstName, lastName, email, phone, linkedinUrl },
  });

  revalidatePath(`/candidates/${candidateId}`);
  revalidatePath("/candidates");
}

export async function addNote(candidateId: string, content: string) {
  const { user, org } = await getUserOrg();

  // Verify candidate belongs to org
  await db.candidate.findFirstOrThrow({
    where: { id: candidateId, organizationId: org.id },
  });

  await db.note.create({
    data: { candidateId, authorId: user.id, content },
  });

  revalidatePath(`/candidates/${candidateId}`);
}

export async function deleteNote(noteId: string, candidateId: string) {
  const { user } = await getUserOrg();
  await db.note.delete({ where: { id: noteId, authorId: user.id } });
  revalidatePath(`/candidates/${candidateId}`);
}

// ============ APPLICATIONS ============

export async function addCandidateToJob(candidateId: string, jobId: string) {
  const { org } = await getUserOrg();

  // Verify both belong to org
  const job = await db.job.findFirstOrThrow({
    where: { id: jobId, organizationId: org.id },
    include: { pipeline: { include: { stages: { orderBy: { order: "asc" } } } } },
  });

  const firstStage = job.pipeline.stages[0];
  if (!firstStage) throw new Error("Pipeline has no stages");

  await db.application.upsert({
    where: { jobId_candidateId: { jobId, candidateId } },
    create: { jobId, candidateId, stageId: firstStage.id },
    update: {},
  });

  revalidatePath(`/jobs/${jobId}`);
}

export async function moveApplicationStage(
  applicationId: string,
  newStageId: string
) {
  const { org } = await getUserOrg();

  // Verify the application belongs to org via job
  const app = await db.application.findFirstOrThrow({
    where: {
      id: applicationId,
      job: { organizationId: org.id },
    },
  });

  await db.application.update({
    where: { id: applicationId },
    data: { stageId: newStageId },
  });

  revalidatePath(`/jobs/${app.jobId}`);
  revalidatePath(`/candidates/${app.candidateId}`);
}

// ============ PIPELINES ============

export async function createPipeline(formData: FormData) {
  const { org } = await getUserOrg();
  const name = formData.get("name") as string || "New Pipeline";

  const pipeline = await db.pipeline.create({
    data: {
      organizationId: org.id,
      name,
      stages: {
        create: [
          { name: "Applied", order: 0, color: "#6366f1" },
          { name: "Review", order: 1, color: "#f59e0b" },
          { name: "Interview", order: 2, color: "#3b82f6" },
          { name: "Offer", order: 3, color: "#10b981" },
        ],
      },
    },
  });

  revalidatePath("/pipelines");
  return pipeline;
}

export async function updatePipeline(pipelineId: string, name: string) {
  const { org } = await getUserOrg();

  await db.pipeline.update({
    where: { id: pipelineId, organizationId: org.id },
    data: { name },
  });

  revalidatePath("/pipelines");
}

export async function deletePipeline(pipelineId: string) {
  const { org } = await getUserOrg();

  // Check if any jobs use this pipeline
  const jobsCount = await db.job.count({
    where: { pipelineId, organizationId: org.id },
  });

  if (jobsCount > 0) {
    throw new Error("Cannot delete pipeline that is being used by jobs.");
  }

  // Check if it's the default pipeline
  const pipeline = await db.pipeline.findUniqueOrThrow({
    where: { id: pipelineId, organizationId: org.id },
  });

  if (pipeline.isDefault) {
    throw new Error("Cannot delete the default pipeline.");
  }

  await db.pipeline.delete({
    where: { id: pipelineId, organizationId: org.id },
  });

  revalidatePath("/pipelines");
}

export async function setDefaultPipeline(pipelineId: string) {
  const { org } = await getUserOrg();

  // Transaction to unset current default and set new default
  await db.$transaction([
    db.pipeline.updateMany({
      where: { organizationId: org.id, isDefault: true },
      data: { isDefault: false },
    }),
    db.pipeline.update({
      where: { id: pipelineId, organizationId: org.id },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/pipelines");
}

export async function reorderStages(pipelineId: string, stageIds: string[]) {
  const { org } = await getUserOrg();

  // Verify pipeline belongs to org
  await db.pipeline.findFirstOrThrow({
    where: { id: pipelineId, organizationId: org.id },
  });

  await db.$transaction(
    stageIds.map((id, index) =>
      db.stage.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidatePath("/pipelines");
}

export async function updateStage(
  stageId: string,
  data: { name?: string; color?: string; order?: number }
) {
  const { org } = await getUserOrg();

  await db.stage.update({
    where: {
      id: stageId,
      pipeline: { organizationId: org.id },
    },
    data,
  });

  revalidatePath("/pipelines");
}

export async function addStage(pipelineId: string, name: string) {
  const { org } = await getUserOrg();

  const lastStage = await db.stage.findFirst({
    where: { pipeline: { id: pipelineId, organizationId: org.id } },
    orderBy: { order: "desc" },
  });

  const stage = await db.stage.create({
    data: {
      pipelineId,
      name,
      order: (lastStage?.order ?? -1) + 1,
    },
  });

  revalidatePath("/pipelines");
}

export async function deleteStage(stageId: string) {
  const { org } = await getUserOrg();

  await db.stage.delete({
    where: {
      id: stageId,
      pipeline: { organizationId: org.id },
    },
  });

  revalidatePath("/pipelines");
}
