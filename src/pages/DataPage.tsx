import { useState, useMemo, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight, X, CheckCircle2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

// --- Generate date-based mock data ---
const today = new Date();

const dailyChartData = Array.from({ length: 16 }, (_, i) => ({
  label: `${6 + i}`,
  profit: Math.round(800 + Math.random() * 1200),
}));

const weeklyChartData = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - 6 + i);
  return {
    label: `${d.getMonth() + 1}/${d.getDate()}`,
    profit: Math.round(3500 + Math.random() * 4000),
  };
});

const monthlyChartData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - 29 + i);
  return {
    label: `${d.getMonth() + 1}/${d.getDate()}`,
    profit: Math.round(3000 + Math.random() * 5000),
  };
});

// --- Other mock data (unchanged) ---
const profitOrders = [
  { id: "#ORD-001", profit: 5.0 },
  { id: "#ORD-002", profit: 8.5 },
  { id: "#ORD-003", profit: 4.0 },
  { id: "#ORD-004", profit: 12.0 },
  { id: "#ORD-005", profit: 6.5 },
  { id: "#ORD-006", profit: 9.0 },
  { id: "#ORD-007", profit: 3.5 },
];

type SettlementStatus = "settlable" | "settled" | "disputed";
const settlementStatusLabels: Record<SettlementStatus, string> = {
  settlable: "可结算",
  settled: "已结算",
  disputed: "我有异议",
};

const settlements = [
  { period: "第1期", amount: 2680, status: "settled" as SettlementStatus },
  { period: "第2期", amount: 3120, status: "settled" as SettlementStatus },
  { period: "第3期", amount: 2950, status: "settlable" as SettlementStatus },
  { period: "第4期", amount: 1580, status: "disputed" as SettlementStatus },
  { period: "第5期", amount: 3400, status: "settlable" as SettlementStatus },
];

// Settlement daily breakdown mock
const settlementDailyDetails = [
  { date: "02/22 周六", cups: 156, amount: 6340 },
  { date: "02/21 周五", cups: 162, amount: 6800 },
  { date: "02/20 周四", cups: 148, amount: 5600 },
  { date: "02/19 周三", cups: 160, amount: 6100 },
  { date: "02/18 周二", cups: 138, amount: 5100 },
  { date: "02/17 周一", cups: 105, amount: 3028 },
];

type TimePeriod = "daily" | "weekly" | "monthly";

const chartConfig = {
  profit: { label: "利润", color: "#a855f7" },
};

// --- Promo Banner Data ---
const promoBanners = [
  {
    id: 1,
    title: "KAKAGO",
    subtitle: "不贵精品，即刻上瘾！",
    coupons: [
      { label: "限时", value: "¥3" },
      { label: "拿铁", value: "¥2" },
      { label: "美式", value: "¥2" },
    ],
    cta: "GO! 自动用券",
  },
  {
    id: 2,
    title: "KAKAGO",
    subtitle: "每日特惠，咖啡不停！",
    coupons: [
      { label: "新品", value: "¥5" },
      { label: "满减", value: "¥3" },
    ],
    cta: "立即领取",
  },
  {
    id: 3,
    title: "KAKAGO",
    subtitle: "邀请好友，双倍积分！",
    coupons: [
      { label: "积分", value: "x2" },
      { label: "返现", value: "¥8" },
      { label: "礼包", value: "¥10" },
    ],
    cta: "去邀请 >",
  },
];

const PromoBanner = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % promoBanners.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  const banner = promoBanners[current];

  return (
    <div className="relative overflow-hidden rounded-xl bg-secondary/40 border border-border/30 px-4 py-3">
      <div
        key={banner.id}
        className="flex items-center justify-between gap-3 animate-fade-in"
      >
        {/* Left: branding */}
        <div className="shrink-0 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">KAKAGO</span>
            <span className="text-primary text-xs">✦</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">{banner.subtitle}</p>
        </div>

        {/* Center: coupon flags */}
        <div className="flex items-end gap-1.5">
          {banner.coupons.map((c, i) => (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ marginTop: i % 2 === 0 ? 0 : 4 }}
            >
              <div className="bg-primary rounded-t-md px-1.5 pt-0.5 pb-0">
                <span className="text-[8px] text-primary-foreground leading-none">{c.label}</span>
              </div>
              <div className="bg-primary rounded-b-md px-2 py-1 clip-flag">
                <span className="text-sm font-black text-primary-foreground leading-none">{c.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: CTA */}
        <button className="shrink-0 text-[10px] text-primary font-medium whitespace-nowrap">
          {banner.cta}
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1 mt-2">
        {promoBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1 h-1 rounded-full transition-all ${
              i === current ? "bg-primary w-3" : "bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const DataPage = () => {
  const [showProfitDetail, setShowProfitDetail] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [settlementStatus, setSettlementStatus] = useState<"pending" | "reviewing">("pending");
  const [settlementFilter, setSettlementFilter] = useState<SettlementStatus | "all">("all");
  const [chartPeriod, setChartPeriod] = useState<TimePeriod>("daily");

  const chartData = useMemo(() => {
    switch (chartPeriod) {
      case "daily": return dailyChartData;
      case "weekly": return weeklyChartData;
      case "monthly": return monthlyChartData;
    }
  }, [chartPeriod]);

  const filteredSettlements = settlementFilter === "all"
    ? settlements
    : settlements.filter(s => s.status === settlementFilter);

  const statusBadgeClass = (status: SettlementStatus) => {
    switch (status) {
      case "settled": return "bg-green-500/20 text-green-400";
      case "settlable": return "bg-primary/20 text-primary";
      case "disputed": return "bg-destructive/20 text-destructive";
    }
  };

  const monthlyProfit = monthlyChartData.reduce((s, v) => s + v.profit, 0);

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-foreground">经营概览</h1>
        <span className="text-xs text-muted-foreground">
          {today.getFullYear()}/{String(today.getMonth() + 1).padStart(2, "0")}/{String(today.getDate()).padStart(2, "0")} {["周日","周一","周二","周三","周四","周五","周六"][today.getDay()]}
        </span>
      </div>

      {/* Promo Banner Carousel */}
      <PromoBanner />

      {/* 四宫格核心数据 */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="bg-primary px-4 py-4 rounded-xl cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => setShowProfitDetail(true)}
        >
          <p className="text-xs text-primary-foreground/70 mb-1.5">今日利润</p>
          <p className="text-2xl font-black text-primary-foreground tracking-tight">¥6,340</p>
          <p className="text-[11px] text-primary-foreground/80 mt-2 flex items-center gap-0.5">
            查看详情 <ChevronRight className="w-3 h-3" />
          </p>
        </Card>
        <Card
          className="bg-primary px-4 py-4 rounded-xl cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => setShowSettlement(true)}
        >
          <p className="text-xs text-primary-foreground/70 mb-1.5">结算周期利润</p>
          <p className="text-2xl font-black text-primary-foreground tracking-tight">¥32,968</p>
          <p className="text-[11px] text-primary-foreground/80 mt-2 flex items-center gap-0.5">
            去对账结算 <ChevronRight className="w-3 h-3" />
          </p>
        </Card>
        <Card className="bg-primary px-4 py-4 rounded-xl">
          <p className="text-xs text-primary-foreground/70 mb-1.5">本月利润</p>
          <p className="text-2xl font-black text-primary-foreground tracking-tight">¥{monthlyProfit.toLocaleString()}</p>
        </Card>
        <Card className="bg-primary px-4 py-4 rounded-xl">
          <p className="text-xs text-primary-foreground/70 mb-1.5">今日出杯</p>
          <p className="text-2xl font-black text-primary-foreground tracking-tight">156</p>
        </Card>
      </div>

      {/* 利润趋势 Chart */}
      <Card className="glass-card p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-foreground">经营看板</h2>
          <div className="flex bg-secondary/50 rounded-md p-0.5">
            {([
              { key: "daily", label: "日" },
              { key: "weekly", label: "周" },
              { key: "monthly", label: "月" },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setChartPeriod(tab.key)}
                className={`px-2.5 py-0.5 text-[10px] font-medium rounded transition-all ${
                  chartPeriod === tab.key
                    ? "text-primary border-b-2 border-primary bg-primary/10"
                    : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <AreaChart
            key={chartPeriod}
            data={chartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: chartPeriod === "monthly" ? 7 : 9, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              interval={0}
              angle={chartPeriod === "monthly" ? -45 : 0}
              textAnchor={chartPeriod === "monthly" ? "end" : "middle"}
              height={chartPeriod === "monthly" ? 25 : 20}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
              width={35}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="profit"
              name="利润"
              stroke="#a855f7"
              strokeWidth={2}
              fill="url(#profitGradient)"
              dot={{ r: chartPeriod === "monthly" ? 1.5 : 3, fill: "#a855f7" }}
              activeDot={{ r: 4 }}
              animationDuration={500}
            />
          </AreaChart>
        </ChartContainer>
      </Card>

      {/* Bottom 2-card row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary px-4 py-4 rounded-xl">
          <p className="text-xs text-primary-foreground/70 mb-1">累计利润</p>
          <p className="text-xl font-black text-primary-foreground">¥125,555</p>
          <p className="text-[10px] text-primary-foreground/60 mt-1">累计出单: 6,420单</p>
        </Card>
        <Card
          className="bg-primary px-4 py-4 rounded-xl cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => setShowSettlement(true)}
        >
          <p className="text-xs text-primary-foreground/70 mb-1">待结算</p>
          <p className="text-lg font-bold text-primary-foreground mt-2 flex items-center gap-1">
            去结算 <ChevronRight className="w-4 h-4" />
          </p>
        </Card>
      </div>

      {/* 今日订单利润 Sheet */}
      <Sheet open={showProfitDetail} onOpenChange={setShowProfitDetail}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[60vh]">
          <SheetHeader className="pb-3">
            <SheetTitle className="text-sm">今日订单利润</SheetTitle>
          </SheetHeader>
          <div className="space-y-1.5 overflow-y-auto max-h-[calc(60vh-70px)]">
            {profitOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/30">
                <span className="text-sm font-bold text-foreground">{o.id}</span>
                <span className="text-sm font-bold text-green-400">+¥{o.profit.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* 本期结算详情 Drawer */}
      <AnimatePresence>
        {showSettlement && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60"
              onClick={() => setShowSettlement(false)}
            />
            {/* Drawer */}
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
                <h2 className="text-sm font-bold text-foreground">本期结算详情</h2>
                <button onClick={() => setShowSettlement(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hero Amount */}
              <div className="px-4 py-5 text-center">
                <p className="text-xs text-muted-foreground mb-1">本期结算利润</p>
                <p className="text-4xl font-black text-foreground tracking-tight">¥32,968</p>
                <p className="text-[11px] text-muted-foreground mt-1">结算周期: 02/16 - 02/22</p>
              </div>

              {/* Daily breakdown */}
              <div className="flex-1 overflow-y-auto px-4 space-y-1.5 pb-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">每日明细</p>
                {settlementDailyDetails.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-secondary/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.date}</p>
                      <p className="text-[11px] text-muted-foreground">共 {d.cups} 杯</p>
                    </div>
                    <span className="text-sm font-bold text-primary">+¥{d.amount.toLocaleString()}</span>
                  </motion.div>
                ))}

                {/* Explanation box */}
                <div className="mt-3 p-3 rounded-xl bg-secondary/40 border border-border/30">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    【KAKAGO 结算规则】商户自正式营业日起，系统默认采用 T+7 周期结算模式。账期内的有效订单利润，将在满7个自然日后转入待结算账户。请仔细核对明细，无误后点击下方按钮完成对账。
                  </p>
                </div>
              </div>

              {/* Sticky bottom */}
              <div className="px-4 py-3 border-t border-border/50">
                {settlementStatus === "pending" ? (
                  <Button
                    className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90"
                    onClick={() => setShowConfirmModal(true)}
                  >
                    去对账结算
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full h-12 text-sm font-medium bg-secondary/50 text-muted-foreground cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    账单已确认，平台复核打款中...
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 对账确认弹窗 */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-background border-border max-w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">确认结算账单</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/30">
              <span className="text-xs text-muted-foreground">结算金额</span>
              <span className="text-lg font-black text-primary">¥32,968</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/30">
              <span className="text-xs text-muted-foreground">打款账户</span>
              <span className="text-xs font-medium text-foreground">KAKAGO 绑定账户 (尾号 8888)</span>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowConfirmModal(false)}
            >
              取消
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-primary"
              onClick={() => {
                setSettlementStatus("reviewing");
                setShowConfirmModal(false);
              }}
            >
              确认无误，申请打款
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataPage;
