import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown, ChevronRight, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// 固定的6种商品
const PRODUCTS = [
  { id: "hot-americano", name: "热美式", color: "bg-primary" },
  { id: "iced-americano", name: "冰美式", color: "bg-success" },
  { id: "hot-latte", name: "热拿铁", color: "bg-warning" },
  { id: "iced-latte", name: "冰拿铁", color: "bg-destructive" },
  { id: "cappuccino", name: "卡布奇诺", color: "bg-secondary" },
  { id: "flat-white", name: "澳白", color: "bg-muted-foreground" },
];

// 模拟订单数据
const mockOrders = [
  { id: "ORD-2024-0156", product: "hot-americano", price: 18, time: "14:32", coupon: 5 },
  { id: "ORD-2024-0155", product: "iced-latte", price: 22, time: "14:28", coupon: 0 },
  { id: "ORD-2024-0154", product: "hot-americano", price: 18, time: "14:15", coupon: 3 },
  { id: "ORD-2024-0153", product: "cappuccino", price: 24, time: "14:02", coupon: 8 },
  { id: "ORD-2024-0152", product: "flat-white", price: 26, time: "13:45", coupon: 0 },
  { id: "ORD-2024-0151", product: "iced-americano", price: 16, time: "13:30", coupon: 5 },
  { id: "ORD-2024-0150", product: "hot-latte", price: 22, time: "13:18", coupon: 0 },
  { id: "ORD-2024-0149", product: "hot-americano", price: 18, time: "13:05", coupon: 3 },
  { id: "ORD-2024-0148", product: "iced-latte", price: 22, time: "12:52", coupon: 10 },
  { id: "ORD-2024-0147", product: "cappuccino", price: 24, time: "12:40", coupon: 0 },
];

const DataPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);

  // 数据计算
  const revenue = 12680; // 营业额
  const revenueChange = 12; // 较昨日变化百分比
  const couponTotal = 1580; // 核销券金总额
  const merchantCouponShare = couponTotal * 0.4; // 商户承担40%
  const profit = revenue * 0.5 - merchantCouponShare; // 利润 = 营业额50% - 商户券补贴
  const profitChange = 8; // 利润较昨日变化

  // 商品出杯统计
  const productCounts: Record<string, number> = {
    "hot-americano": 42,
    "iced-americano": 28,
    "hot-latte": 35,
    "iced-latte": 22,
    "cappuccino": 18,
    "flat-white": 11,
  };
  const totalCups = Object.values(productCounts).reduce((a, b) => a + b, 0);

  // 评价数据
  const rating = 4.8;
  const recentReviews = [
    { rating: 5, comment: "咖啡很香，配送快！", time: "10分钟前" },
    { rating: 4, comment: "口味不错", time: "30分钟前" },
    { rating: 5, comment: "一如既往的好喝", time: "1小时前" },
  ];

  // 获取选中商品的订单
  const getProductOrders = (productId: string) => {
    return mockOrders.filter(order => order.product === productId);
  };

  const selectedProductData = selectedProduct 
    ? PRODUCTS.find(p => p.id === selectedProduct) 
    : null;

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* 财务概览 - 三块布局 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 左边大块 - 今日利润 */}
        <Card className="glass-card p-4 row-span-2 flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1">今日利润</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">¥{profit.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Badge className={`${profitChange >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"} text-xs`}>
              {profitChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {profitChange >= 0 ? "+" : ""}{profitChange}%
            </Badge>
            <span className="text-xs text-muted-foreground">较昨日</span>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-3">
            明天比今天会更好！
          </p>
        </Card>

        {/* 右上 - 今日营业额 */}
        <Card className="glass-card p-3">
          <p className="text-xs text-muted-foreground mb-1">今日营业额</p>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-primary">¥{revenue.toLocaleString()}</span>
            <Badge className="bg-success/20 text-success text-xs shrink-0">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +{revenueChange}%
            </Badge>
          </div>
        </Card>

        {/* 右下 - 商户补贴 */}
        <Card className="glass-card p-3">
          <p className="text-xs text-muted-foreground mb-1">商户补贴</p>
          <span className="text-xl font-bold text-warning">¥{merchantCouponShare.toLocaleString()}</span>
          <p className="text-xs text-muted-foreground/60 mt-1">
            平台补贴: ¥{(couponTotal * 0.6).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* 出杯总数 - 可点击查看全部订单 */}
      <Card 
        className="glass-card p-4 cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => setShowAllOrders(true)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">今日出杯</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">{totalCups}</span>
              <span className="text-sm text-muted-foreground">杯</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="text-xs">查看全部订单</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Card>

      {/* 商品出杯分布 */}
      <Card className="glass-card p-4">
        <h2 className="text-sm font-bold mb-3 text-foreground">商品出杯分布</h2>
        <div className="grid grid-cols-3 gap-2">
          {PRODUCTS.map((product) => (
            <div 
              key={product.id} 
              className="text-center p-3 rounded-lg bg-secondary/30 cursor-pointer active:scale-[0.95] transition-transform"
              onClick={() => setSelectedProduct(product.id)}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${product.color} mx-auto mb-1.5`} />
              <p className="text-xl font-bold text-foreground">{productCounts[product.id]}</p>
              <p className="text-xs text-muted-foreground">{product.name}</p>
              <ChevronRight className="w-3 h-3 mx-auto mt-1 text-muted-foreground/50" />
            </div>
          ))}
        </div>
        
        {/* 进度条 */}
        <div className="mt-4 space-y-1.5">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-14 truncate">{product.name}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${product.color} transition-all`}
                  style={{ width: `${(productCounts[product.id] / totalCups) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round((productCounts[product.id] / totalCups) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 客户评分 */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">客户评价</h2>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-warning fill-warning" />
            <span className="text-lg font-bold text-foreground">{rating}</span>
          </div>
        </div>
        <div className="space-y-2">
          {recentReviews.map((review, index) => (
            <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20">
              <div className="flex items-center gap-0.5 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < review.rating ? "text-warning fill-warning" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground">{review.comment}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{review.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 商品订单详情 Sheet */}
      <Sheet open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[70vh]">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedProductData && (
                  <div className={`w-3 h-3 rounded-full ${selectedProductData.color}`} />
                )}
                <span>{selectedProductData?.name} - 今日订单</span>
              </div>
              <Badge className="bg-primary/20 text-primary">
                {selectedProduct ? getProductOrders(selectedProduct).length : 0} 单
              </Badge>
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-2 overflow-y-auto max-h-[calc(70vh-80px)]">
            {selectedProduct && getProductOrders(selectedProduct).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <p className="text-sm font-bold text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">¥{order.price}</p>
                  {order.coupon > 0 && (
                    <p className="text-xs text-warning">券抵: ¥{order.coupon}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* 全部订单 Sheet */}
      <Sheet open={showAllOrders} onOpenChange={setShowAllOrders}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[80vh]">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center justify-between">
              <span>今日全部订单</span>
              <Badge className="bg-primary/20 text-primary">{totalCups} 杯</Badge>
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-2 overflow-y-auto max-h-[calc(80vh-80px)]">
            {mockOrders.map((order) => {
              const product = PRODUCTS.find(p => p.id === order.product);
              return (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${product?.color}`} />
                    <div>
                      <p className="text-sm font-bold text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{product?.name} · {order.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">¥{order.price}</p>
                    {order.coupon > 0 && (
                      <p className="text-xs text-warning">券抵: ¥{order.coupon}</p>
                    )}
                  </div>
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
