"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { JobStatus } from "@prisma/client";
import { distributeJob, closeJobOnBoards } from "@/lib/distribution";

export async function updateJobStatus(jobId: string, status: JobStatus) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const member = await db.member.findFirst({
        where: { userId: user.id },
        select: { organizationId: true },
    });

    if (!member) {
        throw new Error("Member not found");
    }

    const job = await db.job.findFirst({
        where: {
            id: jobId,
            organizationId: member.organizationId,
        },
    });

    if (!job) {
        throw new Error("Job not found or access denied");
    }

    await db.job.update({
        where: { id: jobId },
        data: { status },
    });

    // Trigger distribution side-effects (fire-and-forget to not block the UI)
    if (status === "OPEN") {
        distributeJob(jobId).catch(console.error);
    } else if (status === "CLOSED") {
        closeJobOnBoards(jobId).catch(console.error);
    }

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);
}
