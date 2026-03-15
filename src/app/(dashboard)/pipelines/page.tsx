import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, GitBranch } from "lucide-react";
import { createPipeline, addStage, deleteStage } from "@/app/actions";

export default async function PipelinesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = await db.member.findFirstOrThrow({
    where: { userId: user!.id },
    select: { organizationId: true },
  });

  const pipelines = await db.pipeline.findMany({
    where: { organizationId: member.organizationId },
    include: {
      stages: { orderBy: { order: "asc" } },
      _count: { select: { jobs: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipelines</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize hiring stages for each pipeline
          </p>
        </div>
        <form action={createPipeline}>
          <input type="hidden" name="name" value="New Pipeline" />
          <Button type="submit" variant="outline" size="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Pipeline
          </Button>
        </form>
      </div>

      <div className="space-y-6">
        {pipelines.map((pipeline) => (
          <div
            key={pipeline.id}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <h2 className="font-semibold text-gray-900">{pipeline.name}</h2>
                {pipeline.isDefault && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 font-medium">
                    Default
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {pipeline._count.jobs} job{pipeline._count.jobs !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-4">
              {pipeline.stages.map((stage, i) => (
                <div key={stage.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm text-gray-700">{stage.name}</span>
                  </div>
                  {i < pipeline.stages.length - 1 && (
                    <span className="text-gray-300">→</span>
                  )}
                </div>
              ))}
            </div>

            <form className="flex gap-2">
              <input type="hidden" name="pipelineId" value={pipeline.id} />
              <label
                htmlFor={`stage-name-${pipeline.id}`}
                className="sr-only"
              >
                New stage name for {pipeline.name}
              </label>
              <input
                id={`stage-name-${pipeline.id}`}
                name="name"
                placeholder="Add stage..."
                className="flex h-8 flex-1 rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              />
              <Button
                formAction={async (fd) => {
                  "use server";
                  await addStage(fd.get("pipelineId") as string, fd.get("name") as string);
                }}
                type="submit"
                variant="outline"
                size="sm"
              >
                Add Stage
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
