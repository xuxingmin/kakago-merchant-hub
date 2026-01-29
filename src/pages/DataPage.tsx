import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Coffee } from "lucide-react";

const DataPage = () => {
  const revenue = 12680;
  const rating = 4.8;
  const totalCups = 156;

  const products = [
    { name: "拿铁", count: 42, color: "bg-primary" },
    { name: "美式", count: 38, color: "bg-success" },
    { name: "卡布奇诺", count: 28, color: "bg-warning" },
    { name: "摩卡", count: 22, color: "bg-destructive" },
    { name: "冰美式", count: 18, color: "bg-secondary" },
    { name: "其他", count: 8, color: "bg-muted" },
  ];

  const recentReviews = [
    { rating: 5, comment: "咖啡很香，配送快！", time: "10分钟前" },
    { rating: 4, comment: "口味不错", time: "30分钟前" },
    { rating: 5, comment: "一如既往的好喝", time: "1小时前" },
  ];

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Revenue Hero */}
      <Card className="glass-card p-6 text-center">
        <p className="text-muted-foreground text-sm mb-1">今日营业额</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-6xl font-bold text-primary">¥{revenue.toLocaleString()}</span>
          <Badge className="bg-success/20 text-success">
            <TrendingUp className="w-3 h-3 mr-1" />
            +12%
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2">较昨日同期</p>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coffee className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground text-sm">出杯数</span>
          </div>
          <span className="text-4xl font-bold">{totalCups}</span>
          <span className="text-muted-foreground text-sm ml-1">杯</span>
        </Card>
        <Card className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 text-warning fill-warning" />
            <span className="text-muted-foreground text-sm">客户评分</span>
          </div>
          <span className="text-4xl font-bold">{rating}</span>
          <span className="text-muted-foreground text-sm ml-1">分</span>
        </Card>
      </div>

      {/* Product Breakdown */}
      <Card className="glass-card p-4">
        <h2 className="text-lg font-bold mb-4">商品出杯分布</h2>
        <div className="grid grid-cols-3 gap-3">
          {products.map((product) => (
            <div key={product.name} className="text-center p-3 rounded-lg bg-secondary/50">
              <div className={`w-3 h-3 rounded-full ${product.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold">{product.count}</p>
              <p className="text-xs text-muted-foreground">{product.name}</p>
            </div>
          ))}
        </div>
        {/* Progress bars */}
        <div className="mt-4 space-y-2">
          {products.map((product) => (
            <div key={product.name} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-16">{product.name}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${product.color} transition-all`}
                  style={{ width: `${(product.count / totalCups) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8">
                {Math.round((product.count / totalCups) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Reviews */}
      <Card className="glass-card p-4">
        <h2 className="text-lg font-bold mb-4">最新评价</h2>
        <div className="space-y-3">
          {recentReviews.map((review, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? "text-warning fill-warning" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm">{review.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">{review.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DataPage;
