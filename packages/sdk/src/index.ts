export type SdkOptions = {
  dsn: string; // API endpoint (e.g. https://api.myhost.com/trpc/ingest)
  projectId: string;
};

function send(options: SdkOptions, payload: unknown) {
  fetch(options.dsn, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: options.projectId,
      payload,
    }),
  }).catch(() => {
    // Todo
  });
}

export function init(options: SdkOptions) {
  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("error", (event: ErrorEvent) => {
    send(options, {
      type: "javascript-error",
      message: String(event.message),
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      stack: event.error?.stack,
      errorName: event.error?.name,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  });

  window.addEventListener(
    "unhandledrejection",
    (event: PromiseRejectionEvent) => {
      const reason = (event.reason ?? {}) as {
        message?: string;
        stack?: string;
        name?: string;
      };
      send(options, {
        type: "unhandled-rejection",
        message: reason.message ?? "Unhandled promise rejection",
        stack: reason.stack,
        errorName: reason.name,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    }
  );
}
