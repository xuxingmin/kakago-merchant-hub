import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ClipboardList, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const PRODUCTS = [
  { id: "hot-americano", name: "热美式", color: "bg-primary" },
  { id: "iced-americano", name: "冰美式", color: "bg-primary/60" },
  { id: "hot-latte", name: "热拿铁", color: "bg-primary/80" },
  { id: "iced-latte", name: "冰拿铁", color: "bg-primary/50" },
  { id: "cappuccino", name: "卡布奇诺", color: "bg-muted-foreground" },
  { id: "flat-white", name: "澳白", color: "bg-muted-foreground/60" },
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

type TimePeriod = "day" | "week" | "month" | "year";
const periodLabels: Record<TimePeriod, string> = { day: "日", week: "周", month: "月", year: "年" };

const DataPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [period, setPeriod] = useState<TimePeriod>("day");

  const revenue = 12680;
  const profit = revenue * 0.5;

  const todoItems = [
    { id: 1, text: "燕麦奶库存不足，剩余12杯用量", urgent: true },
    { id: 2, text: "2条客户评价待回复", urgent: false },
    { id: 3, text: "确认明日补货订单", urgent: false },
  ];

  const productCounts: Record<string, number> = {
    "hot-americano": 42, "iced-americano": 28, "hot-latte": 35,
    "iced-latte": 22, "cappuccino": 18, "flat-white": 11,
  };
  const totalCups = Object.values(productCounts).reduce((a, b) => a + b, 0);

  const recentReviews = [
    { rating: 5, comment: "咖啡很香，配送快！", time: "10分钟前" },
    { rating: 4, comment: "口味不错", time: "30分钟前" },
  ];

  const getProductOrders = (productId: string) =>
    mockOrders.filter(order => order.product === productId);

  const selectedProductData = selectedProduct
    ? PRODUCTS.find(p => p.id === selectedProduct)
    : null;

  const urgentCount = todoItems.filter(t => t.urgent).length;

  return (
    <div className="p-4 pb-24 space-y-3">
      {/* 四宫格核心数据 */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="glass-card px-4 py-3.5 text-center">
          <p className="text-[11px] text-muted-foreground mb-1">今日利润</p>
          <span className="text-xl font-black text-foreground">¥{profit.toLocaleString()}</span>
        </Card>
        <Card className="glass-card px-4 py-3.5 text-center">
          <p className="text-[11px] text-muted-foreground mb-1">结算周利润</p>
          <span className="text-xl font-black text-primary">¥{(profit * 5.2).toLocaleString()}</span>
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

      {/* 待办 */}
      <Card className="glass-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">待办</h2>
          </div>
          <Badge className="bg-primary/20 text-primary text-xs">{todoItems.length} 项</Badge>
        </div>
        <div className="space-y-1">
          {todoItems.map(item => (
            <div key={item.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${item.urgent ? "bg-destructive/10 border border-destructive/20" : "bg-secondary/30"}`}>
              {item.urgent && <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />}
              <span className={`text-xs ${item.urgent ? "text-foreground font-medium" : "text-muted-foreground"}`}>{item.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 销售分析 - 紧凑+时间切换 */}
      <Card className="glass-card p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-foreground">销售分析</h2>
          <div className="flex bg-secondary/40 rounded-md p-0.5">
            {(Object.keys(periodLabels) as TimePeriod[]).map(key => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-2.5 py-0.5 text-xs rounded transition-colors ${period === key ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground"}`}
              >
                {periodLabels[key]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="text-center py-1.5 rounded-md bg-secondary/30 cursor-pointer active:scale-[0.95] transition-transform"
              onClick={() => setSelectedProduct(product.id)}
            >
              <p className="text-base font-bold text-foreground leading-tight">{productCounts[product.id]}</p>
              <p className="text-[10px] text-muted-foreground">{product.name}</p>
            </div>
          ))}
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
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex shrink-0">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-2.5 h-2.5 ${j < review.rating ? "text-primary fill-primary" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-xs text-foreground truncate">{review.comment}</span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">{review.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 商品订单详情 */}
      <Sheet open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[60vh]">
          <SheetHeader className="pb-3">
            <SheetTitle className="flex items-center justify-between">
              <span className="text-sm">{selectedProductData?.name} 今日订单</span>
              <Badge className="bg-primary/20 text-primary text-xs">
                {selectedProduct ? getProductOrders(selectedProduct).length : 0} 单
              </Badge>
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-1.5 overflow-y-auto max-h-[calc(60vh-70px)]">
            {selectedProduct && getProductOrders(selectedProduct).map((order) => (
              <div key={order.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/30">
                <div>
                  <p className="text-sm font-bold text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.time}</p>
                </div>
                <span className="text-sm font-bold text-foreground">¥{order.price}</span>
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
    </div>
  );
};

export default DataPage;
