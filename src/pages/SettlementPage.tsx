import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const processingSettlements = [
  {
    id: "p1",
    period: "第 5 期",
    dateRange: "02/16 周一 - 02/18 周三",
    amount: 12450,
    expectedDate: "预计 02/20 周五到账",
    daily: [
      { date: "02/18 周三", cups: 102, amount: 4100 },
      { date: "02/17 周二", cups: 138, amount: 5100 },
      { date: "02/16 周一", cups: 85, amount: 3250 },
    ],
  },
];

const paidSettlements = [
  {
    id: "s1",
    period: "第 4 期",
    dateRange: "02/09 - 02/15",
    amount: 32968,
    daily: [
      { date: "02/15 周六", cups: 156, amount: 6340 },
      { date: "02/14 周五", cups: 162, amount: 6800 },
      { date: "02/13 周四", cups: 148, amount: 5600 },
      { date: "02/12 周三", cups: 160, amount: 6100 },
      { date: "02/11 周二", cups: 138, amount: 5100 },
      { date: "02/10 周一", cups: 105, amount: 3028 },
    ],
  },
  {
    id: "s2",
    period: "第 3 期",
    dateRange: "02/02 - 02/08",
    amount: 28450,
    daily: [
      { date: "02/08 周六", cups: 140, amount: 5800 },
      { date: "02/07 周五", cups: 155, amount: 6200 },
      { date: "02/06 周四", cups: 130, amount: 5000 },
      { date: "02/05 周三", cups: 145, amount: 5600 },
      { date: "02/04 周二", cups: 120, amount: 4350 },
      { date: "02/03 周一", cups: 95, amount: 1500 },
    ],
  },
];

type Tab = "processing" | "paid";
type Settlement = (typeof processingSettlements)[0] | (typeof paidSettlements)[0];

const SettlementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("processing");
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)} className="mr-3 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-foreground">结算管理</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="flex bg-secondary/50 rounded-lg p-1">
          {([
            { key: "processing" as Tab, label: "结算中" },
            { key: "paid" as Tab, label: "已打款" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-3 pb-24 space-y-3">
        <AnimatePresence mode="wait">
          {activeTab === "processing" ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {processingSettlements.map((s) => (
                <Card key={s.id} className="bg-secondary/30 border-border/30 p-4 rounded-xl">
                  <div className="mb-3">
                    <p className="text-sm font-bold text-foreground">{s.period}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.dateRange}</p>
                  </div>
                  <p className="text-2xl font-black text-foreground tracking-tight mb-2">
                    ¥{s.amount.toLocaleString()}
                  </p>
                  <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-primary/15 text-primary mb-3">
                    {s.expectedDate}
                  </span>
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs font-bold border-primary/50 text-primary hover:bg-primary/10"
                    onClick={() => setSelectedSettlement(s)}
                  >
                    [ 查看明细 ]
                  </Button>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="paid"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {paidSettlements.map((s) => (
                <Card key={s.id} className="bg-secondary/30 border-border/30 p-4 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">{s.period}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{s.dateRange}</p>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-green-500/15 text-green-400">
                      [ 已打款 ]
                    </span>
                  </div>
                  <p className="text-2xl font-black text-foreground tracking-tight mb-3">
                    ¥{s.amount.toLocaleString()}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs font-medium border-border/50 text-muted-foreground hover:bg-secondary/50"
                    onClick={() => setSelectedSettlement(s)}
                  >
                    [ 查看明细 ]
                  </Button>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Details Drawer */}
      <AnimatePresence>
        {selectedSettlement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60"
              onClick={() => setSelectedSettlement(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl border-t border-border flex flex-col"
              style={{ maxHeight: "85vh" }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h2 className="text-sm font-bold text-foreground">结算账单明细</h2>
                <button
                  onClick={() => setSelectedSettlement(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hero Amount */}
              <div className="px-4 py-5 text-center">
                <p className="text-xs text-muted-foreground mb-1">本期结算金额</p>
                <p className="text-4xl font-black text-foreground tracking-tight">
                  ¥{selectedSettlement.amount.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {selectedSettlement.period} ({selectedSettlement.dateRange})
                </p>
              </div>

              {/* Daily breakdown */}
              <div className="flex-1 overflow-y-auto px-4 space-y-1.5 pb-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">每日明细</p>
                {selectedSettlement.daily.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-secondary/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.date}</p>
                      <p className="text-[11px] text-muted-foreground">{d.cups} 杯</p>
                    </div>
                    <span className="text-sm font-bold text-primary">+¥{d.amount.toLocaleString()}</span>
                  </motion.div>
                ))}
              </div>

              {/* Explanation Box */}
              <div className="px-4 py-3">
                <div className="rounded-xl bg-secondary/40 px-3 py-3">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    【KAKAGO 自动结算规则】本平台实行全自动「周结算」模式。每周四系统自动核算上一周期（周一至周日，或入驻日起的实际营业天数）的账单，并于周五（T+1）自动打款至您的绑定账户。您仅需核对账目，无需手动提现。
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="px-4 py-3 border-t border-border/50">
                <Button
                  className="w-full h-12 text-sm font-bold bg-secondary hover:bg-secondary/80 text-muted-foreground"
                  onClick={() => setSelectedSettlement(null)}
                >
                  [ 关闭 ]
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettlementPage;
