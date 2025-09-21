"use client";

import { Button } from "@/components/ui/button";

export function BreakButton() {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          throw new Error("Boom from SDK!");
        }}
        variant="destructive"
      >
        Throw Error
      </Button>
      <Button
        onClick={() => {
          // biome-ignore lint/complexity/noVoid: <sdk test>
          void Promise.reject(new Error("Promise rejection from SDK!"));
        }}
        variant="outline"
      >
        Reject Promise
      </Button>
    </div>
  );
}
