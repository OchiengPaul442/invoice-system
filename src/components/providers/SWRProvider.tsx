"use client";

import { SWRConfig } from "swr";

export function SWRProvider({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        keepPreviousData: true,
        focusThrottleInterval: 1000,
      }}
    >
      {children}
    </SWRConfig>
  );
}

