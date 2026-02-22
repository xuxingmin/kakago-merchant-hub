import { useState, useMemo, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
          className="glass-card px-4 py-4 cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => setShowProfitDetail(true)}
        >
          <p className="text-xs text-muted-foreground mb-1.5">今日利润</p>
          <p className="text-2xl font-black text-foreground tracking-tight">¥6,340</p>
          <p className="text-[11px] text-primary mt-2 flex items-center gap-0.5">
            查看详情 <ChevronRight className="w-3 h-3" />
          </p>
        </Card>
        <Card
          className="glass-card px-4 py-4 cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => setShowSettlement(true)}
        >
          <p className="text-xs text-muted-foreground mb-1.5">结算周期利润</p>
          <p className="text-2xl font-black text-primary tracking-tight">¥32,968</p>
          <p className="text-[11px] text-primary mt-2 flex items-center gap-0.5">
            去对账结算 <ChevronRight className="w-3 h-3" />
          </p>
        </Card>
        <Card className="glass-card px-4 py-4">
          <p className="text-xs text-muted-foreground mb-1.5">本月利润</p>
          <p className="text-2xl font-black text-foreground tracking-tight">¥{monthlyProfit.toLocaleString()}</p>
        </Card>
        <Card className="glass-card px-4 py-4">
          <p className="text-xs text-muted-foreground mb-1.5">今日出杯</p>
          <p className="text-2xl font-black text-foreground tracking-tight">156</p>
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
        <Card className="glass-card px-4 py-4">
          <p className="text-xs text-muted-foreground mb-1">累计利润</p>
          <p className="text-xl font-black text-foreground">¥125,555</p>
          <p className="text-[10px] text-muted-foreground mt-1">累计出单: 6,420单</p>
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

      {/* 账单结算 Sheet */}
      <Sheet open={showSettlement} onOpenChange={setShowSettlement}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[70vh]">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-sm">账单结算</SheetTitle>
          </SheetHeader>
          <div className="flex gap-1 mb-3 bg-secondary/40 rounded-md p-0.5">
            {(["all", "settlable", "settled", "disputed"] as const).map(key => (
              <button
                key={key}
                onClick={() => setSettlementFilter(key)}
                className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${settlementFilter === key ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground"}`}
              >
                {key === "all" ? "全部" : settlementStatusLabels[key]}
              </button>
            ))}
          </div>
          <div className="space-y-1.5 overflow-y-auto max-h-[calc(70vh-110px)]">
            {filteredSettlements.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/30">
                <div>
                  <p className="text-sm font-bold text-foreground">{s.period}</p>
                  <p className="text-xs text-muted-foreground">¥{s.amount.toLocaleString()}</p>
                </div>
                <Badge className={`text-[10px] ${statusBadgeClass(s.status)}`}>{settlementStatusLabels[s.status]}</Badge>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DataPage;
