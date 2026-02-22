import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface DailyDetail {
  date: string;
  cups: number;
  revenue: string;
}

interface Bill {
  id: number;
  status: "processing" | "paid";
  periodName: string;
  dateRange: string;
  amount: string;
  statusText: string;
  details: DailyDetail[];
}

const mockBills: Bill[] = [
  {
    id: 1,
    status: "processing",
    periodName: "第 5 期",
    dateRange: "02/13 周五 - 02/19 周四",
    amount: "32,968",
    statusText: "[ 预计 02/20 周五到账 ]",
    details: [
      { date: "02/19 周四", cups: 156, revenue: "+¥6,340" },
      { date: "02/18 周三", cups: 140, revenue: "+¥5,800" },
      { date: "02/17 周二", cups: 148, revenue: "+¥5,600" },
      { date: "02/16 周一", cups: 160, revenue: "+¥6,100" },
      { date: "02/15 周日", cups: 138, revenue: "+¥5,100" },
      { date: "02/14 周六", cups: 105, revenue: "+¥3,028" },
      { date: "02/13 周五", cups: 92, revenue: "+¥1,000" },
    ],
  },
  {
    id: 2,
    status: "paid",
    periodName: "第 4 期",
    dateRange: "02/06 周五 - 02/12 周四",
    amount: "15,200",
    statusText: "[ 已打款 ]",
    details: [
      { date: "02/12 周四", cups: 130, revenue: "+¥3,200" },
      { date: "02/11 周三", cups: 118, revenue: "+¥2,800" },
      { date: "02/10 周二", cups: 125, revenue: "+¥2,600" },
      { date: "02/09 周一", cups: 110, revenue: "+¥2,100" },
      { date: "02/08 周日", cups: 95, revenue: "+¥1,800" },
      { date: "02/07 周六", cups: 88, revenue: "+¥1,500" },
      { date: "02/06 周五", cups: 72, revenue: "+¥1,200" },
    ],
  },
  {
    id: 3,
    status: "paid",
    periodName: "第 3 期",
    dateRange: "01/30 周五 - 02/05 周四",
    amount: "28,450",
    statusText: "[ 已打款 ]",
    details: [
      { date: "02/05 周四", cups: 155, revenue: "+¥6,200" },
      { date: "02/04 周三", cups: 145, revenue: "+¥5,600" },
      { date: "02/03 周二", cups: 130, revenue: "+¥5,000" },
      { date: "02/02 周一", cups: 140, revenue: "+¥4,800" },
      { date: "02/01 周日", cups: 120, revenue: "+¥3,350" },
      { date: "01/31 周六", cups: 100, revenue: "+¥2,200" },
      { date: "01/30 周五", cups: 88, revenue: "+¥1,300" },
    ],
  },
];

const SettlementPage = () => {
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-foreground">结算管理</h1>
        </div>
      </div>

      {/* All Bills */}
      <div className="px-4 py-3 pb-24 space-y-3">
        {mockBills.map((bill, i) => (
          <motion.div
            key={bill.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <BillCard bill={bill} onViewDetails={() => setSelectedBill(bill)} />
          </motion.div>
        ))}
      </div>

      {/* Details Drawer */}
      <AnimatePresence>
        {selectedBill && (
          <DetailsDrawer
            bill={selectedBill}
            onClose={() => setSelectedBill(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Bill Card ─── */
const BillCard = ({
  bill,
  onViewDetails,
}: {
  bill: Bill;
  onViewDetails: () => void;
}) => {
  const isProcessing = bill.status === "processing";

  return (
    <div className="bg-secondary/30 border border-border/30 p-4 rounded-xl">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-xs text-muted-foreground">{bill.periodName}</p>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {bill.dateRange}
          </p>
        </div>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
            isProcessing
              ? "bg-primary/15 text-primary"
              : "bg-green-500/15 text-green-400"
          }`}
        >
          {isProcessing ? "[ 结算中 ]" : "[ 已结算 ]"}
        </span>
      </div>

      <p
        className={`text-2xl font-black tracking-tight my-3 ${
          isProcessing ? "text-primary" : "text-foreground"
        }`}
      >
        ¥{bill.amount}
      </p>

      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-medium ${
            isProcessing ? "text-primary/70" : "text-green-400/70"
          }`}
        >
          {bill.statusText}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs font-bold border-border/50 text-muted-foreground hover:bg-secondary/50"
          onClick={onViewDetails}
        >
          [ 查看明细 ]
        </Button>
      </div>
    </div>
  );
};

/* ─── Details Drawer ─── */
const DetailsDrawer = ({
  bill,
  onClose,
}: {
  bill: Bill;
  onClose: () => void;
}) => (
  <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60"
      onClick={onClose}
    />
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl border-t border-border flex flex-col"
      style={{ maxHeight: "85vh" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <h2 className="text-sm font-bold text-foreground">结算账单明细</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-5 text-center shrink-0">
        <p className="text-xs text-muted-foreground mb-1">本期结算利润</p>
        <p className="text-4xl font-black text-foreground tracking-tight">
          ¥{bill.amount}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1.5">
          结算周期: {bill.dateRange}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <p className="text-xs font-semibold text-muted-foreground mb-2">每日明细</p>
        {bill.details.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between px-3 py-3 border-b border-border/20 last:border-b-0"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{d.date}</p>
              <p className="text-[11px] text-muted-foreground">共 {d.cups} 杯</p>
            </div>
            <span className="text-sm font-bold text-primary">{d.revenue}</span>
          </motion.div>
        ))}

        <div className="rounded-xl bg-secondary/40 px-3 py-3 mt-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            【KAKAGO 自动结算规则】本平台实行全自动「周结算」模式。系统将自动核算本账期（上周五
            00:00 至本周四
            24:00，含首周非完整天数）的有效订单利润，并于每周五自动打款至您的绑定账户。资金全自动流转，您仅需核对明细，无需手动申请提现。
          </p>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border/50 shrink-0">
        <Button
          className="w-full h-12 text-sm font-bold bg-secondary hover:bg-secondary/80 text-muted-foreground"
          onClick={onClose}
        >
          [ 关闭 ]
        </Button>
      </div>
    </motion.div>
  </>
);

export default SettlementPage;
