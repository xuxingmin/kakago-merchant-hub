import { useEffect, useRef, useState } from "react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, Timer, ArrowDownToLine } from "lucide-react";

interface Props {
  /** Stable id; remounts/resets when it changes */
  paragraphs: string[];
  seconds?: number;
  confirmLabel: string;
  onConfirm: () => void;
  done?: boolean;
  showDownload?: boolean;
  /** Rendered above the document body, e.g. company seals */
  topContent?: ReactNode;
}

/**
 * A scrollable document panel that only enables its confirm button once the
 * reader has (1) waited out the countdown AND (2) scrolled to the very bottom.
 */
const DocumentReader = ({
  paragraphs,
  seconds = 10,
  confirmLabel,
  onConfirm,
  done = false,
  showDownload = false,
  topContent,
}: Props) => {
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (done) return;
    setSecondsLeft(seconds);
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds, done]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) {
      setScrolledBottom(true);
    }
  };

  const ready = done || (secondsLeft === 0 && scrolledBottom);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {showDownload && (
        <div className="mb-2 flex justify-end">
          <button className="flex items-center gap-1 rounded-md bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">
            <Download className="h-3.5 w-3.5" />
            下载/保存文本
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto rounded-xl border border-border bg-secondary/20 p-4"
      >
        {topContent}
        <div className="space-y-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-foreground/80">
              {p}
            </p>
          ))}
        </div>
        <p className="mt-4 border-t border-border/40 pt-3 text-center text-[11px] text-muted-foreground/60">
          — 以上为协议全文，请阅读至此 —
        </p>
      </div>

      {/* Status hint */}
      {!done && (
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px]">
          <span className={`flex items-center gap-1 ${secondsLeft === 0 ? "text-primary" : "text-muted-foreground"}`}>
            <Timer className="h-3.5 w-3.5" />
            {secondsLeft === 0 ? "阅读时间已满" : `请阅读 ${secondsLeft}s`}
          </span>
          <span className={`flex items-center gap-1 ${scrolledBottom ? "text-primary" : "text-muted-foreground"}`}>
            <ArrowDownToLine className="h-3.5 w-3.5" />
            {scrolledBottom ? "已滚动到底部" : "请滑动至底部"}
          </span>
        </div>
      )}

      <Button
        className="mt-3 h-12 w-full bg-primary text-base font-bold"
        disabled={!ready}
        onClick={onConfirm}
      >
        {done ? (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            已完成
          </>
        ) : (
          confirmLabel
        )}
      </Button>
    </div>
  );
};

export default DocumentReader;
