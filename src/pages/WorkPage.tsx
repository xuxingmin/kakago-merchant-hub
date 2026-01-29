import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, Truck, Package, ChefHat } from "lucide-react";

interface Order {
  id: string;
  items: string;
  status: "pending" | "accepted" | "making" | "ready" | "delivering" | "delivered";
  time: number; // seconds elapsed
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
      {/* Store Status Bar */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-sm">营业状态</span>
              <Switch
                checked={isOpen}
                onCheckedChange={setIsOpen}
                className="data-[state=checked]:bg-success"
              />
              <span className={`font-bold ${isOpen ? "text-success" : "text-muted-foreground"}`}>
                {isOpen ? "营业中" : "已关闭"}
              </span>
            </div>
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

      {/* Orders Grid */}
      <div className="grid grid-cols-5 gap-4">
        {/* Pending Orders - Larger Column */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-bold">待接单</h2>
            <Badge variant="outline" className="bg-warning/20 text-warning border-warning">
              {pendingOrders.length}
            </Badge>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
            {pendingOrders.map(order => (
              <Card key={order.id} className="glass-card p-4 border-warning/50">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xl font-bold text-primary">#{order.id}</span>
                    <Badge className="bg-warning text-warning-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(order.time)}
                    </Badge>
                  </div>
                  <p className="text-foreground">{order.items}</p>
                  {!autoAccept && (
                    <Button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="w-full touch-target bg-primary hover:bg-primary/90 text-lg font-bold"
                    >
                      接单
                    </Button>
                  )}
                </div>
              </Card>
            ))}
            {pendingOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                暂无待接订单
              </div>
            )}
          </div>
        </div>

        {/* Making Orders */}
        <div className="col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">制作中</h2>
            <Badge className="bg-primary/20 text-primary">
              {makingOrders.length}
            </Badge>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
            {makingOrders.map(order => (
              <Card key={order.id} className="glass-card p-3 border-primary/50 pulse-active">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-primary">#{order.id}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(order.time)}</span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{order.items}</p>
                  <Button
                    onClick={() => handleFinishOrder(order.id)}
                    size="sm"
                    className="w-full bg-success hover:bg-success/90"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    完成
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Ready Orders */}
        <div className="col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            <h2 className="text-lg font-bold">待取餐</h2>
            <Badge className="bg-success/20 text-success">
              {readyOrders.length}
            </Badge>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
            {readyOrders.map(order => (
              <Card key={order.id} className="glass-card p-3 border-success/50">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-success">#{order.id}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(order.time)}</span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{order.items}</p>
                  <Button
                    onClick={() => handleCallRider(order.id)}
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Truck className="w-4 h-4 mr-1" />
                    呼叫骑手
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Delivering Orders */}
        <div className="col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-bold">配送中</h2>
            <Badge variant="outline">
              {deliveringOrders.length}
            </Badge>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
            {deliveringOrders.map(order => (
              <Card key={order.id} className="glass-card p-3 border-border/50">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold">#{order.id}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(order.time)}</span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{order.items}</p>
                  <Badge variant="secondary" className="w-full justify-center">
                    {order.riderStatus}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkPage;
