"use client";

import { useTransition } from "react";
import { JobStatus } from "@prisma/client";
import { updateJobStatus } from "@/app/(dashboard)/jobs/actions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
    OPEN: "success" as const,
    CLOSED: "secondary" as const,
    DRAFT: "warning" as const,
};

export function JobStatusDropdown({
    jobId,
    initialStatus,
}: {
    jobId: string;
    initialStatus: JobStatus;
}) {
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = (status: string) => {
        startTransition(async () => {
            try {
                await updateJobStatus(jobId, status as JobStatus);
            } catch (error) {
                console.error("Failed to update status", error);
            }
        });
    };

    return (
        <Select
            defaultValue={initialStatus}
            onValueChange={handleStatusChange}
            disabled={isPending}
        >
            <SelectTrigger className="w-[110px] h-7 px-2 py-1 text-xs border-0 bg-transparent shadow-none focus:ring-0 [&>span]:line-clamp-none justify-end">
                <SelectValue>
                    <Badge variant={statusVariant[initialStatus]}>
                        {initialStatus.charAt(0) + initialStatus.slice(1).toLowerCase()}
                    </Badge>
                </SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
                <SelectItem value="DRAFT">
                    <Badge variant="warning">Draft</Badge>
                </SelectItem>
                <SelectItem value="OPEN">
                    <Badge variant="success">Open</Badge>
                </SelectItem>
                <SelectItem value="CLOSED">
                    <Badge variant="secondary">Closed</Badge>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}
