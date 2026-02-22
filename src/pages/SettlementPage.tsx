import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

// Mock data
const pendingSettlements = [
  { id: "p1", period: "第 5 期", dateRange: "02/16 - 02/22", amount: 32968 },
  { id: "p2", period: "第 6 期", dateRange: "02/23 - 03/01", amount: 28450 },
];

const settledHistory = [
  { id: "s1", period: "第 4 期", dateRange: "02/09 - 02/15", amount: 15200 },
  { id: "s2", period: "第 3 期", dateRange: "02/02 - 02/08", amount: 18960 },
  { id: "s3", period: "第 2 期", dateRange: "01/26 - 02/01", amount: 12300 },
];

const dailyBreakdown = [
  { date: "02/22 周六", cups: 156, amount: 6340 },
  { date: "02/21 周五", cups: 162, amount: 6800 },
  { date: "02/20 周四", cups: 148, amount: 5600 },
  { date: "02/19 周三", cups: 160, amount: 6100 },
  { date: "02/18 周二", cups: 138, amount: 5100 },
  { date: "02/17 周一", cups: 105, amount: 3028 },
];

type Tab = "pending" | "settled";

const SettlementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<typeof pendingSettlements[0] | null>(null);
  const [reviewingIds, setReviewingIds] = useState<Set<string>>(new Set());

  // Bank form state
  const [bankForm, setBankForm] = useState({
    name: "",
    bank: "",
    account: "",
    phone: "",
  });

  const handleReconcile = (settlement: typeof pendingSettlements[0]) => {
    setSelectedSettlement(settlement);
    setShowReconciliation(true);
  };

  const handleConfirmWithdraw = () => {
    setShowBankModal(true);
  };

  const handleSubmitApplication = () => {
    if (selectedSettlement) {
      setReviewingIds((prev) => new Set(prev).add(selectedSettlement.id));
    }
    setShowBankModal(false);
    setShowReconciliation(false);
    setBankForm({ name: "", bank: "", account: "", phone: "" });
  };

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
            { key: "pending" as Tab, label: "待结算" },
            { key: "settled" as Tab, label: "已结算" },
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
          {activeTab === "pending" ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {pendingSettlements.map((s) => {
                const isReviewing = reviewingIds.has(s.id);
                return (
                  <Card key={s.id} className="bg-secondary/30 border-border/30 p-4 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">{s.period}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{s.dateRange}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-black text-foreground tracking-tight mb-3">
                      ¥{s.amount.toLocaleString()}
                    </p>
                    {isReviewing ? (
                      <Button
                        disabled
                        className="w-full h-10 text-xs font-medium bg-secondary/50 text-muted-foreground cursor-not-allowed"
                      >
                        [ 复核打款中... ]
                      </Button>
                    ) : (
                      <Button
                        className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90"
                        onClick={() => handleReconcile(s)}
                      >
                        [ 去对账 ]
                      </Button>
                    )}
                  </Card>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="settled"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {settledHistory.map((s) => (
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
                  <p className="text-2xl font-black text-foreground tracking-tight">
                    ¥{s.amount.toLocaleString()}
                  </p>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reconciliation Drawer */}
      <AnimatePresence>
        {showReconciliation && selectedSettlement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60"
              onClick={() => setShowReconciliation(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl border-t border-border flex flex-col"
              style={{ maxHeight: "85vh" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h2 className="text-sm font-bold text-foreground">本期对账单</h2>
                <button
                  onClick={() => setShowReconciliation(false)}
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
                {dailyBreakdown.map((d, i) => (
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

              {/* Sticky bottom */}
              <div className="px-4 py-3 border-t border-border/50">
                <Button
                  className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90"
                  onClick={handleConfirmWithdraw}
                >
                  [ 确认对账并提现 ]
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bank Card Modal */}
      <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
        <DialogContent className="bg-background border-border max-w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">绑定收款账户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-[11px] text-destructive">
              * 首次提现需绑定结算银行卡，请确保信息准确。
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">收款人姓名</Label>
              <Input
                placeholder="请输入收款人姓名"
                value={bankForm.name}
                onChange={(e) => setBankForm((f) => ({ ...f, name: e.target.value }))}
                className="h-10 bg-secondary/30 border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">开户行</Label>
              <Input
                placeholder="请输入开户行名称"
                value={bankForm.bank}
                onChange={(e) => setBankForm((f) => ({ ...f, bank: e.target.value }))}
                className="h-10 bg-secondary/30 border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">银行账号</Label>
              <Input
                placeholder="请输入银行卡号"
                value={bankForm.account}
                onChange={(e) => setBankForm((f) => ({ ...f, account: e.target.value }))}
                className="h-10 bg-secondary/30 border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">预留手机号</Label>
              <Input
                placeholder="请输入预留手机号"
                value={bankForm.phone}
                onChange={(e) => setBankForm((f) => ({ ...f, phone: e.target.value }))}
                className="h-10 bg-secondary/30 border-border/50 text-sm"
              />
            </div>
          </div>
          <Button
            className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 mt-2"
            onClick={handleSubmitApplication}
          >
            [ 提交提现申请 ]
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettlementPage;
