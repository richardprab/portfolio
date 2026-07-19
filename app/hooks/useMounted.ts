import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

// True after hydration, false during SSR — the portal-safe mount check,
// without a setState-in-effect.
export const useMounted = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
