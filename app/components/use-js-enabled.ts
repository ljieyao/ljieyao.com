"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only after client hydration (server snapshot is false, so SSR HTML
 * never carries motion's opacity-0 initial state). React swaps to the client
 * snapshot synchronously post-hydration, before paint — JS users still get
 * the animated reveal, no-JS users see fully rendered content.
 */
export function useJsEnabled(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
