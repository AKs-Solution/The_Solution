"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer, PageHeader, useScopedTabState } from "@/components/layout";
import { Button, Input } from "@/components/ui";

export default function NewDrawingPage() {
  const router = useRouter();
  const [name, setName] = useScopedTabState("drawings.newProjectName", "");
  const [description, setDescription] = useScopedTabState("drawings.newProjectDesc", "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/drawings/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      if (res.ok) {
        router.push("/drawings");
        router.refresh();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setErrorMessage(errJson.error || "Failed to create project.");
      }
    } catch {
      setErrorMessage("Network error creating project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="New drawing project"
        subtitle="Create a workspace for revision comparisons."
        action={
          <Button as="a" href="/drawings" variant="secondary" className="h-9">
            Back to list
          </Button>
        }
      />

      <form
        onSubmit={handleCreateProject}
        className="max-w-xl space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-xs"
      >
        {errorMessage && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">Project name</label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aft bracket set"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800"
        >
          {isSubmitting ? "Creating..." : "Create project"}
        </Button>
      </form>
    </PageContainer>
  );
}
