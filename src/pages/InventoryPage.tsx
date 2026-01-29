import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Package, Milk, Coffee, Phone, Calendar, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const InventoryPage = () => {
  const [showReplenishDialog, setShowReplenishDialog] = useState(false);
  const [replenishItems, setReplenishItems] = useState<Record<string, number>>({});

  const inventory = {
    milk: { current: 15, max: 50, unit: "L", name: "牛奶", icon: Milk, usage: 0.2 },
    beans: { current: 8, max: 20, unit: "kg", name: "咖啡豆", icon: Coffee, usage: 0.015 },
  };

  const packaging = {
    hotCups: { current: 60, max: 300, name: "热杯" },
    coldCups: { current: 80, max: 300, name: "冰杯" },
    hotLids: { current: 50, max: 300, name: "热杯盖" },
    coldLids: { current: 70, max: 300, name: "冰杯盖" },
    paperBags: { current: 100, max: 200, name: "纸袋" },
    sleeves: { current: 80, max: 300, name: "杯套" },
    holders: { current: 40, max: 200, name: "杯托" },
    straws: { current: 200, max: 500, name: "吸管" },
    sealStickers: { current: 150, max: 400, name: "封口贴纸" },
  };

  // Calculate available products based on inventory
  const calculateAvailable = () => {
    const milkLimit = Math.floor(inventory.milk.current / inventory.milk.usage);
    const beansLimit = Math.floor(inventory.beans.current / inventory.beans.usage);
    const cupsLimit = Math.min(packaging.hotCups.current, packaging.coldCups.current);
    const lidsLimit = Math.min(packaging.hotLids.current, packaging.coldLids.current);
    
    return Math.min(milkLimit, beansLimit, cupsLimit, lidsLimit);
  };

  const availableProducts = calculateAvailable();
  const isLowStock = availableProducts < 50;

  const getStockStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage <= 20) return { color: "destructive", text: "紧缺" };
    if (percentage <= 40) return { color: "warning", text: "偏低" };
    return { color: "success", text: "充足" };
  };

  const handleReplenishChange = (key: string, delta: number) => {
    setReplenishItems(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta)
    }));
  };

  const handleSubmitReplenish = () => {
    // Submit logic here
    alert("临时补货费用50元，将从每周结算自动扣除。已提交后台审核！");
    setShowReplenishDialog(false);
    setReplenishItems({});
  };

  const allItems = [
    ...Object.entries(inventory).map(([k, v]) => ({ key: k, ...v })),
    ...Object.entries(packaging).map(([k, v]) => ({ key: k, ...v, unit: "个" })),
  ];

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Header - Store Info & Available Count */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left - Store Info */}
        <Card className="glass-card px-4 py-3">
          <span className="text-base font-bold text-muted-foreground">KAKAGO</span>
          <div className="flex flex-col mt-1">
            <span className="text-xs text-muted-foreground">中关村店</span>
            <span className="text-xs text-muted-foreground">KKG-0012</span>
          </div>
        </Card>

        {/* Right - Available Products */}
        <Card className={`glass-card px-4 py-3 ${isLowStock ? "border-destructive" : "border-success"}`}>
          {isLowStock && (
            <div className="flex items-center gap-1 text-destructive mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold">库存预警</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">当前可售</p>
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${isLowStock ? "text-destructive" : "text-success"}`}>
              {availableProducts}
            </span>
            <span className="text-sm text-muted-foreground ml-1">杯</span>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-1">
            基于库存原材料最低组合计算
          </p>
        </Card>
      </div>

      {/* Replenish Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left - Weekly Info */}
        <Card className="glass-card px-4 py-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-bold text-foreground">KAKAGO</p>
            <p className="text-xs text-muted-foreground">每周定时补货</p>
          </div>
        </Card>

        {/* Right - Emergency Call */}
        <Button 
          className="touch-target text-base font-bold bg-primary hover:bg-primary/90 h-auto py-3"
          onClick={() => setShowReplenishDialog(true)}
        >
          <Phone className="w-5 h-5 mr-1" />
          紧急呼叫补货
        </Button>
      </div>

      {/* Inventory Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Package className="w-5 h-5" />
          库存明细
        </h2>

        {/* Raw Materials */}
        <Card className="glass-card p-4">
          <h3 className="text-sm text-muted-foreground mb-3">原材料</h3>
          <div className="space-y-4">
            {Object.values(inventory).map((item) => {
              const status = getStockStatus(item.current, item.max);
              const percentage = (item.current / item.max) * 100;
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">{item.current}</span>
                      <span className="text-muted-foreground text-sm">/ {item.max} {item.unit}</span>
                      <Badge
                        variant={status.color === "success" ? "default" : status.color === "warning" ? "secondary" : "destructive"}
                        className={
                          status.color === "success" ? "bg-success" :
                          status.color === "warning" ? "bg-warning text-warning-foreground" : ""
                        }
                      >
                        {status.text}
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-2 ${
                      status.color === "destructive" ? "[&>div]:bg-destructive" :
                      status.color === "warning" ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Packaging Materials */}
        <Card className="glass-card p-4">
          <h3 className="text-sm text-muted-foreground mb-3">包材</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(packaging).map((item) => {
              const status = getStockStatus(item.current, item.max);
              const percentage = (item.current / item.max) * 100;
              return (
                <div key={item.name} className="p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1 py-0 ${
                        status.color === "destructive" ? "border-destructive text-destructive" :
                        status.color === "warning" ? "border-warning text-warning" : "border-success text-success"
                      }`}
                    >
                      {status.text}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-bold">{item.current}</span>
                    <span className="text-[10px] text-muted-foreground">/{item.max}</span>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-1 mt-1 ${
                      status.color === "destructive" ? "[&>div]:bg-destructive" :
                      status.color === "warning" ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Replenish Dialog */}
      <Dialog open={showReplenishDialog} onOpenChange={setShowReplenishDialog}>
        <DialogContent className="bg-background border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>紧急补货申请</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {allItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                <span className="text-sm font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleReplenishChange(item.key, -1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-bold">{replenishItems[item.key] || 0}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleReplenishChange(item.key, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-6">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
            <p className="text-sm text-warning font-medium">⚠️ 临时补货费用：¥50</p>
            <p className="text-xs text-muted-foreground mt-1">费用将从每周结算自动扣除</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplenishDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitReplenish} className="bg-primary">
              提交审核
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
