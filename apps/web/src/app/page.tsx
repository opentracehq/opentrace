"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { BreakButton } from "@/components/break-button";
import { queryClient, trpc } from "@/utils/trpc";

const PREVIEW_LENGTH = 100;

export default function Home() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  const errorReports = useQuery(trpc.errorReports.getAll.queryOptions());
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

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

      <div className="mb-6 border border-gray-300 bg-white p-6 dark:border-gray-600 dark:bg-gray-800">
        <h2 className="mb-4 font-medium text-lg dark:text-white">API Status</h2>
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-gray-600 dark:text-gray-300">{statusText}</span>
        </div>
      </div>

      <div className="mb-6 border border-gray-300 bg-white p-6 dark:border-gray-600 dark:bg-gray-800">
        <h2 className="mb-4 font-medium text-lg dark:text-white">
          SDK Test Controls
        </h2>
        <div className="mb-4">
          <BreakButton />
        </div>
      </div>

      <div className="mb-6 border border-gray-300 bg-white p-6 dark:border-gray-600 dark:bg-gray-800">
        <h2 className="mb-4 font-medium text-lg dark:text-white">
          Dev Controls
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            className="border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            disabled={generateOne.isPending}
            onClick={() => generateOne.mutate()}
            type="button"
          >
            {generateOne.isPending ? "Generating..." : "Generate 1 Error"}
          </button>
          <button
            className="border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
        {errorReports.data?.slice(0, 10).map((report) => {
          const isExpanded = expandedErrors.has(report.id);
          return (
            <div
              className="border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800"
              key={report.id}
            >
              <div className="mb-2 font-bold text-gray-900 dark:text-white">
                {report.message}
              </div>
              <div className="mb-2 text-gray-400 text-sm dark:text-gray-500">
                {report.type} · {report.source}:{report.line}:{report.column}
              </div>
              <div className="mb-2 text-gray-500 text-xs dark:text-gray-400">
                {new Date(report.createdAt).toLocaleString()} · {report.userAgent}
              </div>
              <div className="mb-2 text-gray-500 text-xs dark:text-gray-400">
                Project: {report.projectId}
              </div>
              {report.stack && (
                <button
                  className="w-full cursor-pointer text-left"
                  onClick={() => toggleError(report.id)}
                  type="button"
                >
                  {isExpanded ? (
                    <pre className="mt-2 max-h-40 overflow-auto text-gray-700 text-xs dark:text-gray-300">
                      {report.stack}
                    </pre>
                  ) : (
                    <div className="mt-2 text-gray-400 text-xs hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">
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
              className="border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800"
              key={`loading-${crypto.randomUUID()}`}
            >
              <div className="mb-2 h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-700" />
              <div className="mb-2 h-3 w-32 animate-pulse bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-full animate-pulse bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
      </div>
    </div>
  );
}
