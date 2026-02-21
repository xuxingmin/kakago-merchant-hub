import { useState, useEffect, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, ChefHat, Clock } from "lucide-react";
import SwipeableOrderCard from "@/components/SwipeableOrderCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Order {
  id: string;
  items: { name: string; qty: number }[];
  status: "pending" | "making" | "ready" | "delivering" | "delivered";
  orderTime: number;
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

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});

  // Initialize countdowns for pending orders
  useEffect(() => {
    const pending = orders.filter(o => o.status === "pending");
    setCountdowns(prev => {
      const next = { ...prev };
      pending.forEach(o => {
        if (!(o.id in next)) next[o.id] = 30;
      });
      return next;
    });
  }, [orders]);

  // Tick countdowns every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns(prev => {
        const next: Record<string, number> = {};
        for (const [id, val] of Object.entries(prev)) {
          if (val > 0) next[id] = val - 1;
          else next[id] = 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleOpenCancel = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancelReason("");
    setCustomReason("");
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelOrderId) return;
    const reason = cancelReason === "其他" ? customReason : cancelReason;
    if (!reason.trim()) return;
    setOrders(prev => prev.filter(o => o.id !== cancelOrderId));
    setCancelDialogOpen(false);
    setCancelOrderId(null);
  };

  const handleFinishOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: "ready" } : o))
    );
  };

  // Revert ready order back to making (swipe to undo)
  const handleRevertToMaking = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: "making" } : o))
    );
  };

  // These would be triggered by backend API webhooks in production
  // Rider pickup confirmation from aggregated delivery platform API
  const handleRiderPickup = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: "delivering" } : o))
    );
  };

  // Delivery completion confirmation from aggregated delivery platform API
  const handleDeliveryComplete = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: "delivered" } : o))
    );
  };

  // When autoAccept is on, pending orders are treated as making
  const pendingOrders = autoAccept ? [] : orders.filter(o => o.status === "pending");
  const makingOrders = autoAccept 
    ? orders.filter(o => o.status === "pending" || o.status === "making")
    : orders.filter(o => o.status === "making");
  const readyOrders = orders.filter(o => o.status === "ready");
  const deliveringOrders = orders.filter(o => o.status === "delivering");
  const deliveredOrders = orders.filter(o => o.status === "delivered");

  // Sort by wait time (longest first = higher orderTime value)
  const sortedMakingOrders = [...makingOrders].sort((a, b) => b.orderTime - a.orderTime);
  const sortedReadyOrders = [...readyOrders].sort((a, b) => b.orderTime - a.orderTime);
  
  // Combined making + ready for the "制作中" section (making first, then ready, both sorted by wait time)
  const productionOrders = [...sortedMakingOrders, ...sortedReadyOrders];

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
            {/* Pending Orders - Only show when manual accept mode */}
            {!autoAccept && (
              <Card className="glass-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold">待确认订单</h2>
                    <span className="text-xs text-muted-foreground ml-1">用户30s内可取消</span>
                  </div>
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
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <span className="text-xs font-mono text-destructive font-bold">
                              {countdowns[order.id] !== undefined ? `${countdowns[order.id]}s` : "30s"}
                            </span>
                            <Button
                              onClick={() => handleOpenCancel(order.id)}
                              variant="destructive"
                              className="w-16 h-8 text-sm font-bold"
                            >
                              取消
                            </Button>
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">暂无待确认订单</div>
              )}
              </Card>
            )}

            {/* Making Orders (includes ready orders with different button) */}
            <Card className="glass-card p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold">制作中</h2>
                  <span className="text-xs text-muted-foreground ml-1">骑手取货后自动跳转配送</span>
                </div>
                <span className="text-lg font-bold text-foreground">{productionOrders.length}</span>
              </div>
              
              {productionOrders.length > 0 ? (
                <div className="space-y-1.5">
                  {productionOrders.map(order => (
                    order.status === "ready" ? (
                      <SwipeableOrderCard
                        key={order.id}
                        enabled={true}
                        onSwipeLeft={() => handleRevertToMaking(order.id)}
                      >
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
                          <Badge className="px-3 py-2 text-sm font-bold bg-amber-500 text-white border-amber-500 shrink-0">
                            待取餐
                          </Badge>
                        </div>
                      </SwipeableOrderCard>
                    ) : (
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
                          <Button
                            onClick={() => handleFinishOrder(order.id)}
                            className="w-16 h-10 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shrink-0"
                          >
                            完成
                          </Button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-xs">暂无制作中订单</div>
              )}
            </Card>
          </>
        ) : (
          /* Delivery Tab */
          <>
            {/* Delivering Orders */}
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
                        <Badge className="px-3 py-1 text-xs shrink-0 bg-blue-500 text-white border-blue-500">
                          配送中
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-xs">暂无配送中订单</div>
              )}
            </Card>

            {/* Delivered Orders */}
            <Card className="glass-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-green-500" />
                  <h2 className="text-sm font-bold">配送完成</h2>
                </div>
                <span className="text-lg font-bold text-foreground">{deliveredOrders.length}</span>
              </div>
              
              {deliveredOrders.length > 0 ? (
                <div className="space-y-1.5">
                  {deliveredOrders.map(order => (
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
                        <Badge className="px-3 py-1 text-xs shrink-0 bg-green-500 text-white border-green-500">
                          已完成
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-xs">暂无已完成订单</div>
              )}
            </Card>
          </>
        )}
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>取消订单</DialogTitle>
            <DialogDescription>
              请选择取消原因（订单 #{cancelOrderId}）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {["物料不足", "机器故障", "门店过载", "其他"].map((reason) => (
              <button
                key={reason}
                onClick={() => setCancelReason(reason)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  cancelReason === reason
                    ? "border-primary bg-primary/10 text-foreground font-medium"
                    : "border-border bg-secondary/50 text-muted-foreground"
                }`}
              >
                {reason}
              </button>
            ))}
            {cancelReason === "其他" && (
              <Textarea
                placeholder="请输入自定义取消原因..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="mt-2"
                rows={2}
              />
            )}
          </div>
          <Button
            onClick={handleConfirmCancel}
            variant="destructive"
            className="w-full mt-2"
            disabled={!cancelReason || (cancelReason === "其他" && !customReason.trim())}
          >
            确认取消
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkPage;
