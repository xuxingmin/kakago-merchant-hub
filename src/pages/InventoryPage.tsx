import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Package, Milk, Coffee, Box, Phone } from "lucide-react";

const InventoryPage = () => {
  const inventory = {
    milk: { current: 15, max: 50, unit: "L", name: "牛奶", icon: Milk, usage: 0.2 },
    beans: { current: 8, max: 20, unit: "kg", name: "咖啡豆", icon: Coffee, usage: 0.015 },
    cups: { current: 120, max: 500, unit: "个", name: "杯子", usage: 1 },
    lids: { current: 100, max: 500, unit: "个", name: "杯盖", usage: 1 },
    sleeves: { current: 80, max: 300, unit: "个", name: "杯套", usage: 1 },
    straws: { current: 200, max: 500, unit: "个", name: "吸管", usage: 0.5 },
  };

  // Calculate available products based on inventory
  const calculateAvailable = () => {
    const milkLimit = Math.floor(inventory.milk.current / inventory.milk.usage);
    const beansLimit = Math.floor(inventory.beans.current / inventory.beans.usage);
    const cupsLimit = inventory.cups.current;
    const lidsLimit = inventory.lids.current;
    
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

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Available Products Hero */}
      <Card className={`glass-card p-6 text-center ${isLowStock ? "border-destructive" : "border-success"}`}>
        {isLowStock && (
          <div className="flex items-center justify-center gap-2 mb-4 text-destructive">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-bold">库存预警</span>
          </div>
        )}
        <p className="text-muted-foreground text-sm mb-1">当前可售数量</p>
        <span className={`text-7xl font-bold ${isLowStock ? "text-destructive" : "text-success"}`}>
          {availableProducts}
        </span>
        <span className="text-2xl text-muted-foreground ml-2">杯</span>
        <p className="text-muted-foreground text-xs mt-2">
          基于库存原材料计算
        </p>
      </Card>

      {/* Emergency Call Button */}
      <Button className="w-full touch-target text-xl font-bold bg-primary hover:bg-primary/90 h-16">
        <Phone className="w-6 h-6 mr-2" />
        紧急呼叫补货
      </Button>

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
            {[inventory.milk, inventory.beans].map((item) => {
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
          <div className="grid grid-cols-2 gap-4">
            {[inventory.cups, inventory.lids, inventory.sleeves, inventory.straws].map((item) => {
              const status = getStockStatus(item.current, item.max);
              const percentage = (item.current / item.max) * 100;
              return (
                <div key={item.name} className="p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <Badge
                      variant="outline"
                      className={
                        status.color === "destructive" ? "border-destructive text-destructive" :
                        status.color === "warning" ? "border-warning text-warning" : "border-success text-success"
                      }
                    >
                      {status.text}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{item.current}</span>
                    <span className="text-xs text-muted-foreground">/ {item.max}</span>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-1.5 mt-2 ${
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
    </div>
  );
};

export default InventoryPage;
