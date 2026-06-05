import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useOnboarding, OnboardingStage } from "@/contexts/OnboardingContext";
import { useNavigate } from "react-router-dom";

const stages: { value: OnboardingStage; label: string; hint: string }[] = [
  { value: "review", label: "待审核", hint: "空白资料期 · 经营功能置灰" },
  { value: "signing", label: "待签约", hint: "幽灵阻断 · 强制电子签约" },
  { value: "activation", label: "待激活", hint: "签署完成 · 等待总部激活" },
  { value: "active", label: "已转正", hint: "正式经营 · 完全解封" },
];

/**
 * Demo-only control to simulate the merchant stage that HQ would otherwise sync.
 */
const StageSwitcher = () => {
  const { stage, setStage } = useOnboarding();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-3 z-[150] flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 bg-card/90 text-primary backdrop-blur-md"
        style={{ boxShadow: "0 0 16px hsl(270 100% 65% / 0.3)" }}
        aria-label="切换商家阶段(演示)"
      >
        {open ? <X className="h-5 w-5" /> : <SlidersHorizontal className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-32 right-3 z-[150] w-56 rounded-xl border border-border bg-card p-2 shadow-xl">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            演示：商家阶段切换
          </p>
          <div className="space-y-1">
            {stages.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setStage(s.value);
                  navigate("/");
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-2.5 py-2 text-left transition-colors ${
                  stage === s.value ? "bg-primary/15" : "hover:bg-secondary/60"
                }`}
              >
                <p
                  className={`text-[13px] font-semibold ${
                    stage === s.value ? "text-primary" : "text-foreground"
                  }`}
                >
                  {s.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{s.hint}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default StageSwitcher;
