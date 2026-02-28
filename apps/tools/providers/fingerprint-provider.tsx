"use client";

import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const FingerprintContext = createContext<string | null>(null);

export function FingerprintProvider({ children }: { children: ReactNode }) {
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    FingerprintJS.load().then((fp) =>
      fp.get().then((result) => setVisitorId(result.visitorId))
    );
  }, []);

  return (
    <FingerprintContext.Provider value={visitorId}>
      {children}
    </FingerprintContext.Provider>
  );
}

export function useFingerprint() {
  return useContext(FingerprintContext);
}
