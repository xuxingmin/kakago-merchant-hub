import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, ChefHat, Bell } from "lucide-react";

interface Order {
  id: string;
  items: { name: string; qty: number }[];
  status: "pending" | "accepted" | "making" | "ready" | "delivering" | "delivered";
  orderTime: number;
  riderStatus?: string;
}

const mockOrders: Order[] = [
  { id: "K001", items: [{ name: "拿铁", qty: 2 }, { name: "美式", qty: 1 }], status: "pending", orderTime: 45 },
  { id: "K005", items: [{ name: "燕麦拿铁", qty: 1 }], status: "pending", orderTime: 60 },
  { id: "K006", items: [{ name: "冷萃", qty: 2 }], status: "pending", orderTime: 90 },
  { id: "K002", items: [{ name: "卡布奇诺", qty: 1 }], status: "making", orderTime: 180 },
  { id: "K007", items: [{ name: "香草拿铁", qty: 2 }], status: "making", orderTime: 200 },
  { id: "K008", items: [{ name: "焦糖玛奇朵", qty: 1 }], status: "making", orderTime: 220 },
  { id: "K003", items: [{ name: "摩卡", qty: 2 }], status: "ready", orderTime: 420 },
  { id: "K009", items: [{ name: "抹茶拿铁", qty: 1 }], status: "ready", orderTime: 450 },
  { id: "K004", items: [{ name: "冰美式", qty: 3 }], status: "delivering", orderTime: 600 },
  { id: "K010", items: [{ name: "热美式", qty: 2 }], status: "delivering", orderTime: 650 },
];

const WorkPage = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<"order" | "delivery">("order");

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
        o.id === orderId ? { ...o, status: "delivering" } : o
      )
    );
  };

  // When autoAccept is on, pending orders are treated as making
  const pendingOrders = autoAccept ? [] : orders.filter(o => o.status === "pending");
  const makingOrders = autoAccept 
    ? orders.filter(o => o.status === "pending" || o.status === "making")
    : orders.filter(o => o.status === "making");
  const readyOrders = orders.filter(o => o.status === "ready");
  const deliveringOrders = orders.filter(o => o.status === "delivering");

  // Combined making + ready for the "制作中" section
  const productionOrders = [...makingOrders, ...readyOrders];

  return (
    <div className="pb-24">
      {/* Compact Banner */}
      <Card className="glass-card px-4 py-2 mx-4 mt-4">
        <div className="flex items-center">
          <span className="text-base font-bold text-muted-foreground mr-4">KAKAGO</span>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">中关村店</span>
            <span className="text-xs text-muted-foreground">KKG-0012</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <label className="flex items-center gap-1 cursor-pointer">
              <Switch checked={isOnline} onCheckedChange={setIsOnline} className="scale-75 data-[state=checked]:bg-primary" />
              <span className={`text-xs ${isOnline ? "text-foreground" : "text-muted-foreground/50"}`}>{isOnline ? "营业" : "暂停"}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <Switch checked={autoAccept} onCheckedChange={setAutoAccept} className="scale-75 data-[state=checked]:bg-primary" />
              <span className={`text-xs ${autoAccept ? "text-foreground" : "text-muted-foreground/50"}`}>自动</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Tab Switcher */}
      <div className="flex mx-4 mt-3">
        <button
          onClick={() => setActiveTab("order")}
          className={`flex-1 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "order"
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent"
          }`}
        >
          订单状态
        </button>
        <button
          onClick={() => setActiveTab("delivery")}
          className={`flex-1 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "delivery"
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent"
          }`}
        >
          配送状态
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-3">
        {activeTab === "order" ? (
          <>
            {/* New Orders */}
            <Card className="glass-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold">新订单</h2>
                </div>
                <span className="text-lg font-bold text-foreground">{pendingOrders.length}</span>
              </div>
              
              {pendingOrders.length > 0 ? (
                <div className="space-y-1.5">
                  {pendingOrders.map(order => (
                    <div key={order.id} className="px-2 py-1.5 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-0.5">
                            <span className="font-mono text-lg font-bold text-foreground">#{order.id}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatTime(order.orderTime)}</span>
                              <span>共{getTotalQty(order.items)}杯</span>
                            </div>
                          </div>
                          <p className="text-sm text-foreground">{formatItems(order.items)}</p>
                        </div>
                        {!autoAccept && (
                          <Button
                            onClick={() => handleAcceptOrder(order.id)}
                            className="w-16 h-10 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shrink-0"
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

            {/* Making Orders (includes ready orders with different button) */}
            <Card className="glass-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold">制作中</h2>
                </div>
                <span className="text-lg font-bold text-foreground">{productionOrders.length}</span>
              </div>
              
              {productionOrders.length > 0 ? (
                <div className="space-y-1.5">
                  {productionOrders.map(order => (
                    <div key={order.id} className="px-2 py-1.5 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-0.5">
                            <span className="font-mono text-lg font-bold text-foreground">#{order.id}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatTime(order.orderTime)}</span>
                              <span>共{getTotalQty(order.items)}杯</span>
                            </div>
                          </div>
                          <p className="text-sm text-foreground">{formatItems(order.items)}</p>
                        </div>
                        {order.status === "making" ? (
                          <Button
                            onClick={() => handleFinishOrder(order.id)}
                            className="w-16 h-10 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shrink-0"
                          >
                            完成
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleCallRider(order.id)}
                            className="w-16 h-10 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shrink-0"
                          >
                            待取餐
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-xs">暂无制作中订单</div>
              )}
            </Card>
          </>
        ) : (
          /* Delivery Tab */
          <Card className="glass-card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold">配送中</h2>
              </div>
              <span className="text-lg font-bold text-foreground">{deliveringOrders.length}</span>
            </div>
            
            {deliveringOrders.length > 0 ? (
              <div className="space-y-1.5">
                {deliveringOrders.map(order => (
                  <div key={order.id} className="px-2 py-1.5 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-0.5">
                          <span className="font-mono text-lg font-bold text-foreground">#{order.id}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTime(order.orderTime)}</span>
                            <span>共{getTotalQty(order.items)}杯</span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground">{formatItems(order.items)}</p>
                      </div>
                      <Badge variant="secondary" className="px-3 py-1 text-xs shrink-0">
                        配送中
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">暂无配送中订单</div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkPage;
