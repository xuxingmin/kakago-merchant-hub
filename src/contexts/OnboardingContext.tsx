import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * Merchant onboarding stages synced from HQ command center.
 * - review:     空白资料期 / 待审核 — fill store profile, business menus locked
 * - signing:    签约锁定期 / 待签约 — ghost-blocking, must complete e-signing
 * - activation: 已签署待激活 — contract signed, awaiting HQ final activation
 * - active:     正式经营期 / 已转正 — fully unlocked
 */
export type OnboardingStage = "review" | "signing" | "activation" | "active";

const STORAGE_KEY = "kakago_onboarding_stage";

interface OnboardingContextValue {
  stage: OnboardingStage;
  setStage: (stage: OnboardingStage) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [stage, setStageState] = useState<OnboardingStage>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "review" || saved === "signing" || saved === "activation" || saved === "active") {
      return saved;
    }
    // Default to the signing-locked stage so the new flow is demonstrable on first load.
    return "signing";
  });

  const setStage = (next: OnboardingStage) => {
    setStageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, stage);
    } catch {
      /* ignore */
    }
  }, [stage]);

  return (
    <OnboardingContext.Provider value={{ stage, setStage }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
};
