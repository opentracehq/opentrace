"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BreakButton } from "@/components/break-button";
import { ModeToggle } from "@/components/mode-toggle";
import { queryClient, trpc } from "@/utils/trpc";

export default function Home() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  const errorReports = useQuery(trpc.errorReports.getAll.queryOptions());
  const errorGroups = useQuery(
    trpc.errorReports.getGroups.queryOptions({ projectId: "demo" })
  );
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"groups" | "individual">("groups");

  const toggleError = (errorId: string) => {
    setExpandedErrors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const generateOne = useMutation(
    trpc.errorReports.generateOne.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );

  const generateMany = useMutation(
    trpc.errorReports.generateMany.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );

  const deleteAll = useMutation(
    trpc.errorReports.deleteAll.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );

  let statusText = "Disconnected";
  if (healthCheck.isLoading) {
    statusText = "Checking...";
  } else if (healthCheck.data) {
    statusText = "Connected";
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <ModeToggle />
      <pre className="mb-8 overflow-x-auto font-mono text-sm">opentrace</pre>

      <div className="mb-6 border border-neutral-300 bg-white p-6 dark:border-neutral-600 dark:bg-neutral-800">
        <h2 className="mb-4 font-medium text-lg dark:text-white">API Status</h2>
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-neutral-600 dark:text-neutral-300">{statusText}</span>
        </div>
      </div>

      <div className="mb-6 border border-neutral-300 bg-white p-6 dark:border-neutral-600 dark:bg-neutral-800">
        <h2 className="mb-4 font-medium text-lg dark:text-white">
          SDK Test Controls
        </h2>
        <div className="mb-4">
          <BreakButton />
        </div>
      </div>

      <div className="mb-6 border border-neutral-300 bg-white p-6 dark:border-neutral-600 dark:bg-neutral-800">
        <h2 className="mb-4 font-medium text-lg dark:text-white">
          Dev Controls
        </h2>
        <div className="mb-4 flex gap-2">
          <button
            className={`border px-4 py-2 text-sm ${
              viewMode === "groups"
                ? "border-neutral-300 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900/20 dark:text-neutral-400"
                : "border-neutral-300 bg-white hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
            }`}
            onClick={() => setViewMode("groups")}
            type="button"
          >
            Grouped View
          </button>
          <button
            className={`border px-4 py-2 text-sm ${
              viewMode === "individual"
                ? "border-neutral-300 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900/20 dark:text-neutral-400"
                : "border-neutral-300 bg-white hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
            }`}
            onClick={() => setViewMode("individual")}
            type="button"
          >
            Individual Reports
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
            disabled={generateOne.isPending}
            onClick={() => generateOne.mutate()}
            type="button"
          >
            {generateOne.isPending ? "Generating..." : "Generate 1 Error"}
          </button>
          <button
            className="border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
            disabled={generateMany.isPending}
            onClick={() => generateMany.mutate()}
            type="button"
          >
            {generateMany.isPending ? "Generating..." : "Generate 10 Errors"}
          </button>
          <button
            className="border border-red-300 bg-red-50 px-4 py-2 text-red-700 text-sm hover:bg-red-100 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            disabled={deleteAll.isPending}
            onClick={() => deleteAll.mutate()}
            type="button"
          >
            {deleteAll.isPending ? "Deleting..." : "Delete All Errors"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {viewMode === "groups" ? (
          // Grouped View
          <>
            {errorGroups.data?.map((group) => (
              <div
                className="border border-neutral-300 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-800"
                key={group.fingerprint}
              >
                <div className="mb-2 font-bold text-neutral-900 dark:text-white">
                  {group.message}
                </div>
                <div className="mb-2 text-neutral-400 text-sm dark:text-neutral-500">
                  {group.type} · {group.source}
                </div>
                <div className="mb-2 text-neutral-500 text-xs dark:text-neutral-400">
                  First: {new Date(group.firstSeen).toLocaleString()} · Last:{" "}
                  {new Date(group.lastSeen).toLocaleString()}
                </div>
                <div className="mb-2 text-neutral-500 text-xs dark:text-neutral-400">
                  Project: {group.projectId}
                </div>
                <div className="font-medium text-orange-600 text-sm dark:text-orange-400">
                  Occurrences: {group.occurrences}
                </div>
              </div>
            ))}
            {errorGroups.isLoading &&
              Array.from({ length: 5 }).map((_) => (
                <div
                  className="border border-neutral-300 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-800"
                  key={`loading-group-${crypto.randomUUID()}`}
                >
                  <div className="mb-2 h-4 w-24 animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                  <div className="mb-2 h-3 w-32 animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-3 w-full animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                </div>
              ))}
          </>
        ) : (
          // Individual Reports View
          <>
            {errorReports.data?.slice(0, 10).map((report) => {
              const isExpanded = expandedErrors.has(report.id);
              return (
                <div
                  className="border border-neutral-300 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-800"
                  key={report.id}
                >
                  <div className="mb-2 font-bold text-neutral-900 dark:text-white">
                    {report.message}
                  </div>
                  <div className="mb-2 text-neutral-400 text-sm dark:text-neutral-500">
                    {report.type} · {report.source}:{report.line}:
                    {report.column}
                  </div>
                  <div className="mb-2 text-neutral-500 text-xs dark:text-neutral-400">
                    {new Date(report.createdAt).toLocaleString()} ·{" "}
                    {report.userAgent}
                  </div>
                  <div className="mb-2 text-neutral-500 text-xs dark:text-neutral-400">
                    Project: {report.projectId} · Fingerprint:{" "}
                    {report.fingerprint}
                  </div>
                  {report.stack && (
                    <button
                      className="w-full cursor-pointer text-left"
                      onClick={() => toggleError(report.id)}
                      type="button"
                    >
                      {isExpanded ? (
                        <pre className="mt-2 max-h-40 overflow-auto text-neutral-700 text-xs dark:text-neutral-300">
                          {report.stack}
                        </pre>
                      ) : (
                        <div className="mt-2 text-neutral-400 text-xs hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-400">
                          Click to view stack trace...
                        </div>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
            {errorReports.isLoading &&
              Array.from({ length: 10 }).map((_) => (
                <div
                  className="border border-neutral-300 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-800"
                  key={`loading-${crypto.randomUUID()}`}
                >
                  <div className="mb-2 h-4 w-24 animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                  <div className="mb-2 h-3 w-32 animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-3 w-full animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
