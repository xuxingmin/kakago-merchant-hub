import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, AlertTriangle, FileText, Package, MessageCircle, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

// --- Mock Data ---
const dailyChartData = [
  { date: "02/16", profit: 4200, cups: 120 },
  { date: "02/17", profit: 5100, cups: 138 },
  { date: "02/18", profit: 3800, cups: 105 },
  { date: "02/19", profit: 6100, cups: 160 },
  { date: "02/20", profit: 5600, cups: 148 },
  { date: "02/21", profit: 6800, cups: 162 },
  { date: "02/22", profit: 6340, cups: 156 },
];

const weeklyChartData = [
  { date: "第1周", profit: 28000, cups: 780 },
  { date: "第2周", profit: 32000, cups: 890 },
  { date: "第3周", profit: 29500, cups: 820 },
  { date: "第4周", profit: 32968, cups: 910 },
];

const monthlyChartData = [
  { date: "9月", profit: 98000, cups: 2800 },
  { date: "10月", profit: 112000, cups: 3200 },
  { date: "11月", profit: 105000, cups: 3000 },
  { date: "12月", profit: 118000, cups: 3400 },
  { date: "1月", profit: 125000, cups: 3600 },
  { date: "2月", profit: 128600, cups: 3750 },
];

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

const taskCards = [
  { id: 1, type: "invoice" as const, title: "开票申请", desc: "客户张先生申请开具¥256发票", tag: "开票" },
  { id: 2, type: "inventory" as const, title: "库存预警", desc: "燕麦奶库存不足，剩余12杯用量", tag: "库存", urgent: true },
  { id: 3, type: "interaction" as const, title: "互动提醒", desc: "2条客户评价待回复", tag: "互动" },
  { id: 4, type: "inventory" as const, title: "库存预警", desc: "杯盖库存低于安全值", tag: "库存", urgent: true },
];

const taskTypeConfig = {
  invoice: { icon: FileText, color: "bg-primary/20 text-primary" },
  inventory: { icon: Package, color: "bg-destructive/20 text-destructive" },
  interaction: { icon: MessageCircle, color: "bg-accent/60 text-accent-foreground" },
};

type TimePeriod = "daily" | "weekly" | "monthly";

const chartConfig = {
  profit: { label: "利润", color: "hsl(270 100% 50%)" },
  cups: { label: "杯量", color: "hsl(187 92% 53%)" },
};

const DataPage = () => {
  const [showProfitDetail, setShowProfitDetail] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementFilter, setSettlementFilter] = useState<SettlementStatus | "all">("all");
  const [replyReviewIndex, setReplyReviewIndex] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");

  const chartData = useMemo(() => {
    switch (timePeriod) {
      case "daily": return dailyChartData;
      case "weekly": return weeklyChartData;
      case "monthly": return monthlyChartData;
    }
  }, [timePeriod]);

  const recentReviews = [
    { rating: 5, comment: "咖啡很香，配送快！", time: "10分钟前" },
    { rating: 4, comment: "口味不错", time: "30分钟前" },
    { rating: 3, comment: "这次有点凉了", time: "1小时前" },
  ];

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
          <p className="text-xs text-muted-foreground mb-1.5">平台累计收益</p>
          <p className="text-2xl font-black text-foreground tracking-tight">¥128,600</p>
        </Card>
        <Card className="glass-card px-4 py-4">
          <p className="text-xs text-muted-foreground mb-1.5">今日出杯</p>
          <p className="text-2xl font-black text-foreground tracking-tight">156</p>
        </Card>
      </div>

      {/* 杯量与利润趋势 Chart */}
      <Card className="glass-card p-4">
        <h2 className="text-sm font-bold text-foreground mb-3">杯量与利润趋势</h2>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="profit"
              orientation="left"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="cups"
              orientation="right"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              yAxisId="profit"
              type="monotone"
              dataKey="profit"
              stroke="hsl(270 100% 50%)"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(270 100% 50%)" }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="cups"
              type="monotone"
              dataKey="cups"
              stroke="hsl(187 92% 53%)"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(187 92% 53%)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full bg-primary inline-block" />
            <span className="text-[10px] text-muted-foreground">利润</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: "hsl(187 92% 53%)" }} />
            <span className="text-[10px] text-muted-foreground">杯量</span>
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

      {/* 任务卡 */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">任务卡</h2>
          <Badge className="bg-primary/20 text-primary text-xs">{taskCards.length} 项</Badge>
        </div>
        <div className="space-y-2">
          {taskCards.map(task => {
            const config = taskTypeConfig[task.type];
            const Icon = config.icon;
            return (
              <div key={task.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${task.urgent ? "bg-destructive/10 border border-destructive/20" : "bg-secondary/30"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">{task.title}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground">{task.tag}</Badge>
                    {task.urgent && <AlertTriangle className="w-3 h-3 text-destructive" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{task.desc}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[11px] h-7 px-3 text-primary shrink-0">去处理</Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 客户评价 */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">客户评价</h2>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-bold text-foreground">4.8</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {recentReviews.map((review, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/20">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex shrink-0">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-3 h-3 ${j < review.rating ? "text-primary fill-primary" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-xs text-foreground truncate">{review.comment}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[10px] text-muted-foreground">{review.time}</span>
                <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-primary" onClick={() => setReplyReviewIndex(i)}>回复</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

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

      {/* 回复评价 Dialog */}
      <Dialog open={replyReviewIndex !== null} onOpenChange={(open) => { if (!open) { setReplyReviewIndex(null); setReplyText(""); } }}>
        <DialogContent className="bg-background border-border max-w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm">回复评价</DialogTitle>
          </DialogHeader>
          {replyReviewIndex !== null && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-secondary/20">
                <div className="flex shrink-0">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-2.5 h-2.5 ${j < recentReviews[replyReviewIndex].rating ? "text-primary fill-primary" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-xs text-foreground">{recentReviews[replyReviewIndex].comment}</span>
              </div>
              <Textarea
                placeholder="输入回复内容..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                className="min-h-[80px] text-sm bg-secondary/20 border-border"
              />
            </div>
          )}
          <DialogFooter>
            <Button size="sm" className="w-full" onClick={() => { setReplyReviewIndex(null); setReplyText(""); }}>提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataPage;
