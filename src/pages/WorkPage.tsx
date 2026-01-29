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
  orderTime: number;
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
          ? { ...o, status: "delivering", riderStatus: "骑手已取餐" }
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
      {/* Compact Banner */}
      <Card className="glass-card px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-muted-foreground">KAKAGO</span>
            <span className="text-xs text-muted-foreground">中关村店 · KKG-0012</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Switch checked={isOnline} onCheckedChange={setIsOnline} className="scale-75 data-[state=checked]:bg-primary" />
              <span className={isOnline ? "text-primary" : ""}>{isOnline ? "营业" : "暂停"}</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Switch checked={autoAccept} onCheckedChange={setAutoAccept} className="scale-75 data-[state=checked]:bg-primary" />
              <span className={autoAccept ? "text-primary" : ""}>自动</span>
            </label>
          </div>
        </div>
      </Card>

      {/* New Orders */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">新订单</h2>
          </div>
          <span className="text-2xl font-bold text-foreground">{pendingOrders.length}</span>
        </div>
        
        {pendingOrders.length > 0 ? (
          <div className="space-y-3">
            {pendingOrders.map(order => (
              <div key={order.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-mono text-2xl font-bold text-foreground">#{order.id}</span>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">{formatTime(order.orderTime)}</span>
                        <span className="text-xs text-muted-foreground">共{getTotalQty(order.items)}杯</span>
                      </div>
                    </div>
                    <p className="text-foreground font-medium">{formatItems(order.items)}</p>
                  </div>
                  {!autoAccept && (
                    <Button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="w-24 h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shrink-0"
                    >
                      接单
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">暂无新订单</div>
        )}
      </Card>

      {/* Making Orders */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">制作中</h2>
          </div>
          <span className="text-2xl font-bold text-foreground">{makingOrders.length}</span>
        </div>
        
        {makingOrders.length > 0 ? (
          <div className="space-y-3">
            {makingOrders.map(order => (
              <div key={order.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-mono text-2xl font-bold text-foreground">#{order.id}</span>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">{formatTime(order.orderTime)}</span>
                        <span className="text-xs text-muted-foreground">共{getTotalQty(order.items)}杯</span>
                      </div>
                    </div>
                    <p className="text-foreground font-medium">{formatItems(order.items)}</p>
                  </div>
                  <Button
                    onClick={() => handleFinishOrder(order.id)}
                    className="w-24 h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shrink-0"
                  >
                    完成
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">暂无制作中订单</div>
        )}
      </Card>

      {/* Ready for Pickup */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">待取餐</h2>
          </div>
          <span className="text-2xl font-bold text-foreground">{readyOrders.length}</span>
        </div>
        
        {readyOrders.length > 0 ? (
          <div className="space-y-3">
            {readyOrders.map(order => (
              <div key={order.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-mono text-2xl font-bold text-foreground">#{order.id}</span>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">{formatTime(order.orderTime)}</span>
                        <span className="text-xs text-muted-foreground">共{getTotalQty(order.items)}杯</span>
                      </div>
                    </div>
                    <p className="text-foreground font-medium">{formatItems(order.items)}</p>
                  </div>
                  <Button
                    onClick={() => handleCallRider(order.id)}
                    className="w-24 h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shrink-0"
                  >
                    取餐
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">暂无待取餐订单</div>
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
            <span className="text-2xl font-bold text-foreground">{deliveringOrders.length}</span>
          </div>
          
          <div className="space-y-3">
            {deliveringOrders.map(order => (
              <div key={order.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-mono text-2xl font-bold text-foreground">#{order.id}</span>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">{formatTime(order.orderTime)}</span>
                        <span className="text-xs text-muted-foreground">共{getTotalQty(order.items)}杯</span>
                      </div>
                    </div>
                    <p className="text-foreground font-medium">{formatItems(order.items)}</p>
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
