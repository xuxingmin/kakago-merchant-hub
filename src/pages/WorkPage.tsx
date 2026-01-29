import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, Truck, Package, ChefHat, Bell } from "lucide-react";

interface Order {
  id: string;
  items: string;
  status: "pending" | "accepted" | "making" | "ready" | "delivering" | "delivered";
  time: number;
  riderStatus?: string;
}

const mockOrders: Order[] = [
  { id: "K001", items: "拿铁 x2, 美式 x1", status: "pending", time: 45 },
  { id: "K002", items: "卡布奇诺 x1", status: "making", time: 180 },
  { id: "K003", items: "摩卡 x2", status: "ready", time: 420 },
  { id: "K004", items: "冰美式 x3", status: "delivering", time: 600, riderStatus: "骑手已取餐" },
];

const WorkPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      {/* Row 1: Store Status */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">营业状态</span>
            <Switch
              checked={isOpen}
              onCheckedChange={setIsOpen}
              className="data-[state=checked]:bg-success"
            />
            <Badge className={isOpen ? "bg-success" : "bg-muted"}>
              {isOpen ? "营业中" : "已关闭"}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">自动接单</span>
            <Switch
              checked={autoAccept}
              onCheckedChange={setAutoAccept}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </Card>

      {/* Row 2: Pending Orders - Most Important */}
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
              <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xl font-bold text-primary">#{order.id}</span>
                    <Badge variant="outline" className="text-warning border-warning">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(order.time)}
                    </Badge>
                  </div>
                  <p className="text-foreground">{order.items}</p>
                </div>
                {!autoAccept && (
                  <Button
                    onClick={() => handleAcceptOrder(order.id)}
                    className="touch-target bg-primary hover:bg-primary/90 text-lg font-bold px-8"
                  >
                    接单
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            暂无新订单
          </div>
        )}
      </Card>

      {/* Row 3: Making Orders */}
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
              <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-lg font-bold text-primary">#{order.id}</span>
                    <span className="text-sm text-muted-foreground">{formatTime(order.time)}</span>
                  </div>
                  <p className="text-sm text-foreground">{order.items}</p>
                </div>
                <Button
                  onClick={() => handleFinishOrder(order.id)}
                  className="touch-target bg-success hover:bg-success/90 font-bold px-6"
                >
                  <Check className="w-5 h-5 mr-1" />
                  完成
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            暂无制作中订单
          </div>
        )}
      </Card>

      {/* Row 4: Ready for Pickup */}
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
              <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg bg-success/10 border border-success/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-lg font-bold text-success">#{order.id}</span>
                    <span className="text-sm text-muted-foreground">{formatTime(order.time)}</span>
                  </div>
                  <p className="text-sm text-foreground">{order.items}</p>
                </div>
                <Button
                  onClick={() => handleCallRider(order.id)}
                  className="touch-target bg-primary hover:bg-primary/90 font-bold px-6"
                >
                  <Truck className="w-5 h-5 mr-1" />
                  呼叫骑手
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            暂无待取餐订单
          </div>
        )}
      </Card>

      {/* Row 5: Delivering */}
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
              <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-lg font-bold">#{order.id}</span>
                    <span className="text-sm text-muted-foreground">{formatTime(order.time)}</span>
                  </div>
                  <p className="text-sm text-foreground">{order.items}</p>
                </div>
                <Badge variant="secondary" className="px-4 py-2">
                  {order.riderStatus}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WorkPage;
