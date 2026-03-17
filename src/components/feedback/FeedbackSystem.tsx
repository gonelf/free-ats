"use client";

import * as React from "react";
import { MessageSquare, ThumbsUp, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { createFeedback, upvoteFeedback } from "@/app/actions/feedback";
import { Feedback, FeedbackType } from "@prisma/client";

interface FeedbackSystemProps {
  initialFeedbacks: Feedback[];
  currentUserId: string;
}

export function FeedbackSystem({ initialFeedbacks, currentUserId }: FeedbackSystemProps) {
  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>(initialFeedbacks);
  const [isPending, setIsPending] = React.useTransition();

  const features = feedbacks.filter((f) => f.type === "FEATURE");
  const bugs = feedbacks.filter((f) => f.type === "BUG");

  async function handleUpvote(id: string) {
    setIsPending(async () => {
      await upvoteFeedback(id);
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === id && !f.voterIds.includes(currentUserId)
            ? { ...f, votes: f.votes + 1, voterIds: [...f.voterIds, currentUserId] }
            : f
        )
      );
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const type = formData.get("type") as FeedbackType;
    const description = formData.get("description") as string;

    if (!title) return;

    setIsPending(async () => {
      await createFeedback(formData);
      // For simplicity, we just add it to the local state after the action succeeds
      // In a real app, you might want a more robust sync or use useActionState
      const newFeedback: any = {
        id: Math.random().toString(), // Temp ID
        title,
        type,
        description,
        votes: 0,
        voterIds: [],
        createdAt: new Date(),
      };
      setFeedbacks([newFeedback, ...feedbacks]);
      (e.target as HTMLFormElement).reset();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-indigo-600 text-white px-3 py-2 rounded-l-xl shadow-lg hover:bg-indigo-700 transition-all group flex items-center gap-1.5"
        >
          <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span className="font-semibold tracking-wider text-sm">REQUEST</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <MessageSquare className="h-6 w-6 text-indigo-600" />
            Feedback & Requests
          </DialogTitle>
        </DialogHeader>

        <TabsPrimitive.Root defaultValue="FEATURE" className="flex-1 flex flex-col overflow-hidden">
          <TabsPrimitive.List className="flex border-b bg-gray-50/50">
            <TabsPrimitive.Trigger
              value="FEATURE"
              className="flex-1 py-3 px-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 transition-all font-semibold"
            >
              Features
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger
              value="BUG"
              className="flex-1 py-3 px-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 transition-all font-semibold"
            >
              Bugs
            </TabsPrimitive.Trigger>
          </TabsPrimitive.List>

          <TabsContent value="FEATURE" title="Feature Requests" items={features} onUpvote={handleUpvote} currentUserId={currentUserId} />
          <TabsContent value="BUG" title="Bug Reports" items={bugs} onUpvote={handleUpvote} currentUserId={currentUserId} />
        </TabsPrimitive.Root>

        <div className="p-6 border-t bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input name="title" placeholder="Summary of your request..." required className="bg-white" />
              </div>
              <select
                name="type"
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-700 font-medium"
                defaultValue="FEATURE"
              >
                <option value="FEATURE">Feature Request</option>
                <option value="BUG">Bug Report</option>
              </select>
              <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
            <Textarea name="description" placeholder="More details (optional)..." className="bg-white" />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabsContent({
  value,
  title,
  items,
  onUpvote,
  currentUserId,
}: {
  value: string;
  title: string;
  items: Feedback[];
  onUpvote: (id: string) => void;
  currentUserId: string;
}) {
  return (
    <TabsPrimitive.Content value={value} className="flex-1 overflow-y-auto p-6 outline-none">
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium">No {title.toLowerCase()} yet.</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl border bg-white shadow-sm hover:border-indigo-200 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-600 border-gray-300">
                    {item.type}
                  </Badge>
                </div>
                {item.description && <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{item.description}</p>}
                <p className="text-[10px] text-gray-400 mt-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => onUpvote(item.id)}
                disabled={item.voterIds.includes(currentUserId)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                  item.voterIds.includes(currentUserId)
                    ? "bg-indigo-50 text-indigo-600"
                    : "hover:bg-gray-100 text-gray-500 hover:text-indigo-600"
                )}
              >
                <ThumbsUp className={cn("h-5 w-5", item.voterIds.includes(currentUserId) && "fill-current")} />
                <span className="text-xs font-bold">{item.votes}</span>
              </button>
            </div>
          ))
        )}
      </div>
    </TabsPrimitive.Content>
  );
}
