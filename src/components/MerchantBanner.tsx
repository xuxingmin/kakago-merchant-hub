import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Power, Megaphone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const announcements = [
  {
    id: 1, tag: "[系统通知]", title: "财务自动结算链路已升级", date: "2026-02-22",
    content: "为了提升商户资金周转效率，本周起 KAKAGO 已全面升级为全自动周结算模式。每周五系统将自动打款至您的绑定账户，无需手动操作提现。请前往「结算管理」查看账单明细。",
  },
  {
    id: 2, tag: "[运营战报]", title: "合肥蜀山测试店周日出杯量突破300杯", date: "2026-02-21",
    content: "热烈祝贺合肥蜀山测试店！通过精准的社区运营和发券策略，单日去重出杯量成功突破 300 杯。相关运营 SOP 已同步至商户学习中心，欢迎各位店长参考复用。",
  },
  {
    id: 3, tag: "[物料上新]", title: "3月春季特调拼配豆已上线", date: "2026-02-20",
    content: "研发部最新推出的春季特调拼配咖啡豆（花魁拼配）现已加入订货清单。请各门店及时前往「智能补货」模块进行采购，预计到货周期为 3-5 天。",
  },
  {
    id: 4, tag: "[培训通知]", title: "本周六新品制作培训直播", date: "2026-02-19",
    content: "总部将于本周六下午2点进行春季新品制作培训线上直播，请各门店咖啡师准时参加，直播链接将在开播前1小时推送。",
  },
  {
    id: 5, tag: "[平台公告]", title: "3月起配送费补贴政策调整", date: "2026-02-18",
    content: "自3月1日起，配送费补贴将由平台统一承担，商户无需再分摊配送成本。具体细则请查阅最新版商户合作协议。",
  },
  {
    id: 6, tag: "[运营战报]", title: "全国门店总出杯量突破50万杯", date: "2026-02-17",
    content: "截至本周，KAKAGO 全国合作门店累计出杯量已突破 50 万杯，感谢每一位合作伙伴的努力与坚持！",
  },
];

interface Announcement {
  id: number;
  tag: string;
  title: string;
  date: string;
  content: string;
}

const VISIBLE_COUNT = 3;

const MerchantBanner = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [selectedNews, setSelectedNews] = useState<Announcement | null>(null);
  const [startIndex, setStartIndex] = useState(0);

  // Rotate visible window every 3s when more than VISIBLE_COUNT items
  useEffect(() => {
    if (announcements.length <= VISIBLE_COUNT) return;
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % announcements.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
        {/* Top row: store info + switch */}
        <div className="flex items-center px-4 py-1.5">
          <span className="text-base font-bold text-muted-foreground mr-4 shrink-0">
            KAKAGO
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-foreground">中关村店</span>
            <span className="text-[10px] text-muted-foreground">KKG-0012</span>
          </div>
          <div className="ml-auto shrink-0">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={isOnline}
                onCheckedChange={setIsOnline}
                className="scale-75 data-[state=checked]:bg-primary"
              />
              {isOnline ? (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-xs text-foreground whitespace-nowrap">上线接单中</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 animate-bounce">
                  <Power className="w-5 h-5 text-foreground animate-ping" />
                  <span className="text-sm font-black text-foreground animate-pulse whitespace-nowrap">上线</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Announcement list - shows 3, scrolls through all */}
        <div className="mx-3 mb-2 rounded-xl bg-secondary/60 border-l-3 border-primary overflow-hidden">
          <div className="flex items-center gap-2 px-3 pt-2 pb-1">
            <Megaphone className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-bold text-primary">广播</span>
            {announcements.length > VISIBLE_COUNT && (
              <span className="text-[10px] text-muted-foreground ml-auto">{announcements.length} 条</span>
            )}
          </div>
          <div className="px-3 pb-2 space-y-0.5 relative overflow-hidden" style={{ height: `${VISIBLE_COUNT * 28}px` }}>
            <AnimatePresence mode="popLayout">
              {Array.from({ length: VISIBLE_COUNT }).map((_, i) => {
                const idx = (startIndex + i) % announcements.length;
                const item = announcements[idx];
                return (
                  <motion.button
                    key={`${item.id}-${startIndex}`}
                    layout
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="w-full flex items-center gap-1.5 py-1 px-1 rounded-md hover:bg-muted/40 transition-colors text-left cursor-pointer h-[26px]"
                    onClick={() => setSelectedNews(item)}
                  >
                    <span className="text-[11px] font-semibold text-primary shrink-0">{item.tag}</span>
                    <span className="text-[11px] text-foreground truncate">{item.title}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setSelectedNews(null)}
            />
            {/* Modal */}
            <motion.div
              className="relative w-full max-w-md rounded-xl bg-secondary border border-border/50 overflow-hidden"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <span className="text-xs font-medium text-primary">{selectedNews.tag}</span>
                    <h3 className="text-base font-bold text-foreground leading-tight">{selectedNews.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                {/* Date */}
                <p className="text-[11px] text-muted-foreground">{selectedNews.date}</p>
                {/* Content */}
                <p className="text-sm text-foreground/85 leading-relaxed">{selectedNews.content}</p>
                {/* Footer */}
                <button
                  onClick={() => setSelectedNews(null)}
                  className="w-full mt-2 py-2 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MerchantBanner;
