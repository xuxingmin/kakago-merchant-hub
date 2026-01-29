import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, Truck, Package, ChefHat, Bell } from "lucide-react";

interface Order {
  id: string;
  items: { name: string; qty: number }[];
  status: "pending" | "accepted" | "making" | "ready" | "delivering" | "delivered";
  orderTime: number; // seconds since ordered
  riderStatus?: string;
}

const mockOrders: Order[] = [
  { id: "K001", items: [{ name: "拿铁", qty: 2 }, { name: "美式", qty: 1 }], status: "pending", orderTime: 45 },
  { id: "K002", items: [{ name: "卡布奇诺", qty: 1 }], status: "making", orderTime: 180 },
  { id: "K003", items: [{ name: "摩卡", qty: 2 }], status: "ready", orderTime: 420 },
  { id: "K004", items: [{ name: "冰美式", qty: 3 }], status: "delivering", orderTime: 600, riderStatus: "骑手已取餐" },
];

const WorkPage = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTotalQty = (items: { name: string; qty: number }[]) => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  };

  const formatItems = (items: { name: string; qty: number }[]) => {
    return items.map(item => `${item.name} ×${item.qty}`).join("、");
  };

  const handleAcceptOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: "making" } : o))
    );
  };

  const handleFinishOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: "ready" } : o))
    );
  };

  const handleCallRider = (orderId: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, status: "delivering", riderStatus: "呼叫骑手中..." }
          : o
      )
    );
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const makingOrders = orders.filter(o => o.status === "making");
  const readyOrders = orders.filter(o => o.status === "ready");
  const deliveringOrders = orders.filter(o => o.status === "delivering");

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Banner Card */}
      <Card className="glass-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-lg font-bold text-primary">KAKAGO</span>
              <span className="text-xs text-muted-foreground ml-1">商户端</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isOnline}
                onCheckedChange={setIsOnline}
                className="data-[state=checked]:bg-success"
              />
              <span className={`text-sm font-medium ${isOnline ? "text-success" : "text-muted-foreground"}`}>
                {isOnline ? "上线中" : "已下线"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">自动接单</span>
            <Switch
              checked={autoAccept}
              onCheckedChange={setAutoAccept}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </Card>

      {/* New Orders */}
      <Card className="glass-card p-4 border-warning/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-bold">新订单</h2>
          </div>
          <Badge className="bg-warning text-warning-foreground text-lg px-3">
            {pendingOrders.length}
          </Badge>
        </div>
        
        {pendingOrders.length > 0 ? (
          <div className="space-y-3">
            {pendingOrders.map(order => (
              <div key={order.id} className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Order ID & Time */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xl font-bold text-primary">#{order.id}</span>
                      <div className="flex items-center gap-1 text-warning">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{formatTime(order.orderTime)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        共{getTotalQty(order.items)}杯
                      </Badge>
                    </div>
                    {/* Product Names */}
                    <p className="text-foreground">{formatItems(order.items)}</p>
                  </div>
                  {!autoAccept && (
                    <Button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="touch-target bg-primary hover:bg-primary/90 text-lg font-bold px-8 shrink-0"
                    >
                      接单
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            暂无新订单
          </div>
        )}
      </Card>

      {/* Making Orders */}
      <Card className="glass-card p-4 border-primary/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">制作中</h2>
          </div>
          <Badge className="bg-primary/20 text-primary text-lg px-3">
            {makingOrders.length}
          </Badge>
        </div>
        
        {makingOrders.length > 0 ? (
          <div className="space-y-3">
            {makingOrders.map(order => (
              <div key={order.id} className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-lg font-bold text-primary">#{order.id}</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm">{formatTime(order.orderTime)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        共{getTotalQty(order.items)}杯
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{formatItems(order.items)}</p>
                  </div>
                  <Button
                    onClick={() => handleFinishOrder(order.id)}
                    className="touch-target bg-success hover:bg-success/90 font-bold px-6 shrink-0"
                  >
                    <Check className="w-5 h-5 mr-1" />
                    完成
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            暂无制作中订单
          </div>
        )}
      </Card>

      {/* Ready for Pickup */}
      <Card className="glass-card p-4 border-success/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-success" />
            <h2 className="text-lg font-bold">待取餐</h2>
          </div>
          <Badge className="bg-success/20 text-success text-lg px-3">
            {readyOrders.length}
          </Badge>
        </div>
        
        {readyOrders.length > 0 ? (
          <div className="space-y-3">
            {readyOrders.map(order => (
              <div key={order.id} className="p-3 rounded-lg bg-success/10 border border-success/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-lg font-bold text-success">#{order.id}</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm">{formatTime(order.orderTime)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        共{getTotalQty(order.items)}杯
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{formatItems(order.items)}</p>
                  </div>
                  <Button
                    onClick={() => handleCallRider(order.id)}
                    className="touch-target bg-primary hover:bg-primary/90 font-bold px-6 shrink-0"
                  >
                    <Truck className="w-5 h-5 mr-1" />
                    呼叫骑手
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            暂无待取餐订单
          </div>
        )}
      </Card>

      {/* Delivering */}
      {deliveringOrders.length > 0 && (
        <Card className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-bold">配送中</h2>
            </div>
            <Badge variant="outline" className="text-lg px-3">
              {deliveringOrders.length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {deliveringOrders.map(order => (
              <div key={order.id} className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-lg font-bold">#{order.id}</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm">{formatTime(order.orderTime)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        共{getTotalQty(order.items)}杯
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{formatItems(order.items)}</p>
                  </div>
                  <Badge variant="secondary" className="px-4 py-2 shrink-0">
                    {order.riderStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WorkPage;
