import { useState, useMemo } from "react";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

// --- Mock Data ---
const dailyChartData = Array.from({ length: 24 }, (_, i) => ({
  label: `${i}时`,
  profit: Math.round(200 + Math.random() * 400),
  cumulative: 0,
  orders: Math.round(3 + Math.random() * 12),
})).map((item, i, arr) => {
  const cumulative = arr.slice(0, i + 1).reduce((s, v) => s + v.profit, 0);
  return { ...item, cumulative };
});

const weeklyChartData = [
  { label: "周一", profit: 4200, cumulative: 4200, orders: 120 },
  { label: "周二", profit: 5100, cumulative: 9300, orders: 138 },
  { label: "周三", profit: 3800, cumulative: 13100, orders: 105 },
  { label: "周四", profit: 6100, cumulative: 19200, orders: 160 },
  { label: "周五", profit: 5600, cumulative: 24800, orders: 148 },
  { label: "周六", profit: 6800, cumulative: 31600, orders: 162 },
  { label: "周日", profit: 6340, cumulative: 37940, orders: 156 },
];

const monthlyChartData = Array.from({ length: 31 }, (_, i) => {
  const profit = Math.round(3000 + Math.random() * 4000);
  return {
    label: `${i + 1}日`,
    profit,
    cumulative: 0,
    orders: Math.round(80 + Math.random() * 80),
  };
}).map((item, i, arr) => {
  const cumulative = arr.slice(0, i + 1).reduce((s, v) => s + v.profit, 0);
  return { ...item, cumulative };
});

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
  profit: { label: "利润", color: "hsl(var(--primary))" },
  cumulative: { label: "累计收益", color: "hsl(187 92% 53%)" },
  orders: { label: "订单数", color: "hsl(45 93% 58%)" },
};

const DataPage = () => {
  const [showProfitDetail, setShowProfitDetail] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementFilter, setSettlementFilter] = useState<SettlementStatus | "all">("all");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");

  const chartData = useMemo(() => {
    switch (timePeriod) {
      case "daily": return dailyChartData;
      case "weekly": return weeklyChartData;
      case "monthly": return monthlyChartData;
    }
  }, [timePeriod]);

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

  // Compute monthly profit from monthly data
  const monthlyProfit = monthlyChartData.reduce((s, v) => s + v.profit, 0);

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Header with time period selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-foreground">经营概览</h1>
        <div className="flex gap-0 bg-secondary/50 rounded-lg p-0.5">
          {([
            { key: "daily", label: "日" },
            { key: "weekly", label: "周" },
            { key: "monthly", label: "月" },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setTimePeriod(tab.key)}
              className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${
                timePeriod === tab.key
                  ? "text-primary border-b-2 border-primary bg-primary/10"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

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

      {/* 利润趋势 Chart - 3 lines */}
      <Card className="glass-card p-4">
        <h2 className="text-sm font-bold text-foreground mb-3">利润趋势</h2>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              interval={timePeriod === "daily" ? 3 : timePeriod === "monthly" ? 4 : 0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="profit"
              name="利润"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 2, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="累计收益"
              stroke="hsl(187 92% 53%)"
              strokeWidth={2}
              dot={{ r: 2, fill: "hsl(187 92% 53%)" }}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              name="订单数"
              stroke="hsl(45 93% 58%)"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-5 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full bg-primary inline-block" />
            <span className="text-[10px] text-muted-foreground">利润</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: "hsl(187 92% 53%)" }} />
            <span className="text-[10px] text-muted-foreground">累计收益</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full inline-block border-t border-dashed" style={{ borderColor: "hsl(45 93% 58%)" }} />
            <span className="text-[10px] text-muted-foreground">订单数</span>
          </div>
        </div>
      </Card>

      {/* Bottom 2-card row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="glass-card px-4 py-4">
          <p className="text-xs text-muted-foreground mb-1">累计利润</p>
          <p className="text-xl font-black text-foreground">¥125,555</p>
          <p className="text-[10px] text-muted-foreground mt-1">今日出单: 156单</p>
        </Card>
        <Card
          className="bg-primary px-4 py-4 rounded-xl cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => setShowSettlement(true)}
        >
          <p className="text-xs text-primary-foreground/70 mb-1">账单结算</p>
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
