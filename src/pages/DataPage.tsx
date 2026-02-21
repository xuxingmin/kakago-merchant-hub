import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, AlertTriangle, FileText, Package, MessageCircle, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PRODUCTS = [
  { id: "hot-americano", name: "热美式" },
  { id: "iced-americano", name: "冰美式" },
  { id: "hot-latte", name: "热拿铁" },
  { id: "iced-latte", name: "冰拿铁" },
  { id: "cappuccino", name: "卡布奇诺" },
  { id: "flat-white", name: "澳白" },
];

const mockOrders = [
  { id: "ORD-2024-0156", product: "hot-americano", price: 18, time: "14:32" },
  { id: "ORD-2024-0155", product: "iced-latte", price: 22, time: "14:28" },
  { id: "ORD-2024-0154", product: "hot-americano", price: 18, time: "14:15" },
  { id: "ORD-2024-0153", product: "cappuccino", price: 24, time: "14:02" },
  { id: "ORD-2024-0152", product: "flat-white", price: 26, time: "13:45" },
  { id: "ORD-2024-0151", product: "iced-americano", price: 16, time: "13:30" },
  { id: "ORD-2024-0150", product: "hot-latte", price: 22, time: "13:18" },
  { id: "ORD-2024-0149", product: "hot-americano", price: 18, time: "13:05" },
  { id: "ORD-2024-0148", product: "iced-latte", price: 22, time: "12:52" },
  { id: "ORD-2024-0147", product: "cappuccino", price: 24, time: "12:40" },
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

const productCounts: Record<string, number> = {
  "hot-americano": 42, "iced-americano": 28, "hot-latte": 35,
  "iced-latte": 22, "cappuccino": 18, "flat-white": 11,
};
const totalCups = Object.values(productCounts).reduce((a, b) => a + b, 0);

const DataPage = () => {
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showProfitDetail, setShowProfitDetail] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementFilter, setSettlementFilter] = useState<SettlementStatus | "all">("all");
  const [replyReviewIndex, setReplyReviewIndex] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const revenue = 12680;
  const profit = revenue * 0.5;

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
    <div className="p-4 pb-24 space-y-3">
      {/* 四宫格核心数据 */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="glass-card px-4 py-3.5 text-center" onClick={() => setShowProfitDetail(true)}>
          <p className="text-[11px] text-muted-foreground mb-1">今日利润</p>
          <span className="text-xl font-black text-foreground">¥{profit.toLocaleString()}</span>
          <p className="text-[10px] text-primary mt-1 flex items-center justify-center gap-0.5 cursor-pointer">查看详情 <ChevronRight className="w-3 h-3" /></p>
        </Card>
        <Card className="glass-card px-4 py-3.5 text-center" onClick={() => setShowSettlement(true)}>
          <p className="text-[11px] text-muted-foreground mb-1">结算周利润</p>
          <span className="text-xl font-black text-primary">¥{(profit * 5.2).toLocaleString()}</span>
          <p className="text-[10px] text-primary mt-1 flex items-center justify-center gap-0.5 cursor-pointer">去对账结算 <ChevronRight className="w-3 h-3" /></p>
        </Card>
        <Card className="glass-card px-4 py-3.5 text-center">
          <p className="text-[11px] text-muted-foreground mb-1">平台累计收益</p>
          <span className="text-xl font-black text-foreground">¥{(128600).toLocaleString()}</span>
        </Card>
        <Card
          className="glass-card px-4 py-3.5 text-center cursor-pointer active:scale-[0.97] transition-transform"
          onClick={() => setShowAllOrders(true)}
        >
          <p className="text-[11px] text-muted-foreground mb-1">今日出杯</p>
          <span className="text-xl font-black text-foreground">{totalCups}</span>
        </Card>
      </div>

      {/* 任务卡 */}
      <Card className="glass-card p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-foreground">任务卡</h2>
          <Badge className="bg-primary/20 text-primary text-xs">{taskCards.length} 项</Badge>
        </div>
        <div className="space-y-1.5">
          {taskCards.map(task => {
            const config = taskTypeConfig[task.type];
            const Icon = config.icon;
            return (
              <div key={task.id} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg ${task.urgent ? "bg-destructive/10 border border-destructive/20" : "bg-secondary/30"}`}>
                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">{task.title}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-muted-foreground/30 text-muted-foreground">{task.tag}</Badge>
                    {task.urgent && <AlertTriangle className="w-3 h-3 text-destructive" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{task.desc}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-primary shrink-0">去处理</Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 客户评价 */}
      <Card className="glass-card p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-foreground">客户评价</h2>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="text-sm font-bold text-foreground">4.8</span>
          </div>
        </div>
        <div className="space-y-1">
          {recentReviews.map((review, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-secondary/20">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex shrink-0">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-2.5 h-2.5 ${j < review.rating ? "text-primary fill-primary" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-xs text-foreground truncate">{review.comment}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[10px] text-muted-foreground">{review.time}</span>
                <Button variant="ghost" size="sm" className="text-[10px] h-5 px-1.5 text-primary" onClick={() => setReplyReviewIndex(i)}>回复</Button>
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

      {/* 全部订单 */}
      <Sheet open={showAllOrders} onOpenChange={setShowAllOrders}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[70vh]">
          <SheetHeader className="pb-3">
            <SheetTitle className="flex items-center justify-between">
              <span className="text-sm">今日全部订单</span>
              <Badge className="bg-primary/20 text-primary text-xs">{totalCups} 杯</Badge>
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-1.5 overflow-y-auto max-h-[calc(70vh-70px)]">
            {mockOrders.map((order) => {
              const product = PRODUCTS.find(p => p.id === order.product);
              return (
                <div key={order.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-sm font-bold text-foreground">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{product?.name} · {order.time}</p>
                  </div>
                  <span className="text-sm font-bold text-foreground">¥{order.price}</span>
                </div>
              );
            })}
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
