import { useState, useEffect, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, ChefHat, Clock, History } from "lucide-react";
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
    return items.map(item => `${item.name} ×${item.qty}`);
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

  const pendingOrders = orders.filter(o => o.status === "pending");
  const makingOrders = orders.filter(o => o.status === "making");
  const readyOrders = orders.filter(o => o.status === "ready");
  const deliveringOrders = orders.filter(o => o.status === "delivering");
  const deliveredOrders = orders.filter(o => o.status === "delivered");

  // Sort by wait time (longest first)
  const sortedMakingOrders = [...makingOrders].sort((a, b) => b.orderTime - a.orderTime);
  const sortedReadyOrders = [...readyOrders].sort((a, b) => b.orderTime - a.orderTime);
  
  // 制作中区域：制作中订单在前，待取餐订单在后
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
          <div className="ml-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={isOnline} onCheckedChange={setIsOnline} className="scale-75 data-[state=checked]:bg-primary" />
              <div className="flex items-center gap-1.5">
                {isOnline && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
                <span className={`text-xs ${isOnline ? "text-foreground" : "text-muted-foreground/50"}`}>{isOnline ? "上线接单中" : "暂时休息中"}</span>
              </div>
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
            {/* 待确认 - 用户30s内可取消 */}
            <Card className="glass-card p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold">待确认</h2>
                  <span className="text-xs text-muted-foreground ml-1">用户30s内可取消</span>
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
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                            {formatItems(order.items).map((item, i) => (
                              <span key={i} className="text-sm text-foreground">{item}</span>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleOpenCancel(order.id)}
                          className="w-20 h-9 text-xs font-bold shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          取消 {countdowns[order.id] !== undefined ? `${countdowns[order.id]}s` : "30s"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">暂无待确认</div>
              )}
            </Card>

            {/* 制作中 - 完成制作→小票扫码→骑手取货，全自动流转 */}
            <Card className="glass-card p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold">制作中</h2>
                  <span className="text-xs text-muted-foreground ml-1">完成制作→小票扫码→骑手取货</span>
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
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                              {formatItems(order.items).map((item, i) => (
                                <span key={i} className="text-sm text-foreground">{item}</span>
                              ))}
                            </div>
                          </div>
                          <Button
                            disabled
                            className="w-20 h-9 text-xs font-bold shrink-0 bg-primary text-primary-foreground opacity-80"
                          >
                            待取餐
                          </Button>
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
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                              {formatItems(order.items).map((item, i) => (
                                <span key={i} className="text-sm text-foreground">{item}</span>
                              ))}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleOpenCancel(order.id)}
                            className="w-20 h-9 text-xs font-bold shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            紧急取消
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
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                            {formatItems(order.items).map((item, i) => (
                              <span key={i} className="text-sm text-foreground">{item}</span>
                            ))}
                          </div>
                        </div>
                        <Badge className="px-3 py-1 text-xs shrink-0 bg-primary/80 text-primary-foreground border-primary/80">
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

            {/* 历史订单 - 按时间倒序无限下拉 */}
            <Card className="glass-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold">历史订单</h2>
                </div>
                <span className="text-lg font-bold text-foreground">{deliveredOrders.length}</span>
              </div>
              
              {deliveredOrders.length > 0 ? (
                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                  {[...deliveredOrders].sort((a, b) => b.orderTime - a.orderTime).map(order => (
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
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                            {formatItems(order.items).map((item, i) => (
                              <span key={i} className="text-sm text-foreground">{item}</span>
                            ))}
                          </div>
                        </div>
                        <Badge className="px-3 py-1 text-xs shrink-0 bg-muted text-foreground border-border">
                          已完成
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-xs">暂无历史订单</div>
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
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
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
