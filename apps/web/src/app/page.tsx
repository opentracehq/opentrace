"use client";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export default function Home() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  let statusText = "Disconnected";
  if (healthCheck.isLoading) {
    statusText = "Checking...";
  } else if (healthCheck.data) {
    statusText = "Connected";
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre className="overflow-x-auto font-mono text-sm">opentrace</pre>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-muted-foreground text-sm">{statusText}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
