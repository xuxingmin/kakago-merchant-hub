import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, FileSignature, Lock, Hourglass, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";

/**
 * Global onboarding gate.
 * - signing stage: ghost full-screen blocking modal forcing the merchant to sign.
 * - activation stage: elegant "awaiting activation" static screen.
 * The review-stage page locking is handled per-page via <LockedBusinessOverlay/>.
 */
const OnboardingGate = () => {
  const { stage } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  const onSigningRoute = location.pathname === "/signing";

  return (
    <AnimatePresence>
      {/* === Stage 2: 签约锁定期 — Ghost blocking modal === */}
      {stage === "signing" && !onSigningRoute && (
        <motion.div
          key="signing-block"
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />
          <motion.div
            initial={{ scale: 0.9, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="relative w-full max-w-sm rounded-2xl border border-primary/30 bg-card p-6 text-center"
            style={{ boxShadow: "0 0 40px hsl(270 100% 65% / 0.25)" }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
              审核已通过
            </p>
            <h2 className="mb-2 text-lg font-bold text-foreground">入驻资料已通过审核！</h2>
            <p className="mb-6 text-[13px] leading-relaxed text-muted-foreground">
              请先完成法律协议签署以正式激活店铺。完成签约后即可解锁全部经营功能。
            </p>
            <Button
              className="h-12 w-full bg-primary text-base font-bold"
              onClick={() => navigate("/signing")}
            >
              <FileSignature className="mr-2 h-5 w-5" />
              去签署
            </Button>
            <p className="mt-3 text-[10px] text-muted-foreground/60">
              签约期间门店资料将锁定为只读，以确保合同与证照一致
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* === Stage 3.5: 已签署待激活 — Elegant waiting screen === */}
      {stage === "activation" && (
        <motion.div
          key="activation-wait"
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background" />
          <div className="relative flex flex-col items-center text-center">
            <div className="relative mb-8">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <Hourglass className="h-10 w-10 animate-pulse text-primary" />
              </div>
            </div>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Coffee className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">TRIVA</span>
            </div>
            <h2 className="mb-3 text-xl font-bold text-foreground">合同签署成功</h2>
            <p className="max-w-[260px] text-[13px] leading-relaxed text-muted-foreground">
              您的法律协议已全部签署完成，正在等待总部完成最终激活。激活后店铺将自动解封，开启经营之旅。
            </p>
            <div className="mt-8 flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-[12px] text-foreground">总部审核激活中…</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Page-level lock for business modules during the review (待审核) stage.
 * Wrap a business page's content; pass `unlocked` for the store-profile flow.
 */
export const LockedBusinessOverlay = ({ label = "资料审核通过后开通" }: { label?: string }) => (
  <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/80">
      <Lock className="h-7 w-7 text-muted-foreground" />
    </div>
    <p className="text-sm font-semibold text-foreground">{label}</p>
    <p className="max-w-[240px] text-center text-[12px] text-muted-foreground">
      请先在「我的 - 门店资料」中完善门店信息并上传证照，等待总部审核
    </p>
  </div>
);

export default OnboardingGate;
