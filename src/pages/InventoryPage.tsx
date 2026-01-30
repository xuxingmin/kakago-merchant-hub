import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Package, Milk, Coffee, Phone, Plus, Minus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import SmartSupplyChainWidget from "@/components/SmartSupplyChainWidget";
import { 
  useStore, 
  useRawMaterials, 
  usePackagingMaterials, 
  calculateAvailableCups,
  RawMaterial,
  PackagingMaterial
} from "@/hooks/useInventory";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Milk,
  Coffee,
};

const InventoryPage = () => {
  const [showReplenishDialog, setShowReplenishDialog] = useState(false);
  const [replenishItems, setReplenishItems] = useState<Record<string, number>>({});

  const { data: store, isLoading: storeLoading } = useStore();
  const { data: rawMaterials = [], isLoading: rawLoading } = useRawMaterials();
  const { data: packagingMaterials = [], isLoading: packagingLoading } = usePackagingMaterials();

  const isLoading = storeLoading || rawLoading || packagingLoading;

  const availableProducts = calculateAvailableCups(rawMaterials, packagingMaterials);
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
    alert("临时补货费用50元，将从每周结算自动扣除。已提交后台审核！");
    setShowReplenishDialog(false);
    setReplenishItems({});
  };

  const allItems = [
    ...rawMaterials.map((m) => ({ key: m.id, name: m.name, unit: m.unit })),
    ...packagingMaterials.map((m) => ({ key: m.id, name: m.name, unit: "个" })),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-3 pb-20 space-y-2">
      {/* Header - Store Info & Available Count */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="glass-card px-3 py-2">
          <span className="text-sm font-bold text-muted-foreground">{store?.brand || "KAKAGO"}</span>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{store?.name || "门店"}</span>
            <span className="text-xs text-muted-foreground">{store?.code || ""}</span>
          </div>
        </Card>

        <Card className={`glass-card px-3 py-2 ${isLowStock ? "border-destructive" : "border-success"}`}>
          {isLowStock && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-bold">库存预警</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">当前可售</p>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${isLowStock ? "text-destructive" : "text-success"}`}>
              {availableProducts}
            </span>
            <span className="text-xs text-muted-foreground ml-1">杯</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60">基于库存原材料最低组合计算</p>
        </Card>
      </div>

      {/* Supply Chain & Emergency Replenish */}
      <div className="grid grid-cols-2 gap-2">
        <SmartSupplyChainWidget />

        <Button 
          className="text-sm font-bold bg-primary hover:bg-primary/90 h-auto py-2"
          onClick={() => setShowReplenishDialog(true)}
        >
          <Phone className="w-4 h-4 mr-1" />
          紧急呼叫补货
        </Button>
      </div>

      {/* Inventory Details */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold flex items-center gap-1">
          <Package className="w-4 h-4" />
          库存明细
        </h2>

        {/* Raw Materials */}
        <Card className="glass-card p-3">
          <h3 className="text-xs text-muted-foreground mb-2">原材料</h3>
          <div className="space-y-2">
            {rawMaterials.map((item) => {
              const status = getStockStatus(item.current_amount, item.max_amount);
              const percentage = (item.current_amount / item.max_amount) * 100;
              const IconComponent = iconMap[item.icon] || Package;
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold">{item.current_amount}</span>
                      <span className="text-muted-foreground text-xs">/ {item.max_amount} {item.unit}</span>
                      <Badge
                        variant={status.color === "success" ? "default" : status.color === "warning" ? "secondary" : "destructive"}
                        className={`text-[10px] px-1.5 py-0 ${
                          status.color === "success" ? "bg-success" :
                          status.color === "warning" ? "bg-warning text-warning-foreground" : ""
                        }`}
                      >
                        {status.text}
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-1.5 ${
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
        <Card className="glass-card p-3">
          <h3 className="text-xs text-muted-foreground mb-2">包材</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {packagingMaterials.map((item) => {
              const status = getStockStatus(item.current_amount, item.max_amount);
              const percentage = (item.current_amount / item.max_amount) * 100;
              return (
                <div key={item.id} className="p-1.5 rounded bg-secondary/30">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-muted-foreground truncate">{item.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[8px] px-1 py-0 h-3 ${
                        status.color === "destructive" ? "border-destructive text-destructive" :
                        status.color === "warning" ? "border-warning text-warning" : "border-success text-success"
                      }`}
                    >
                      {status.text}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm font-bold">{item.current_amount}</span>
                    <span className="text-[8px] text-muted-foreground">/{item.max_amount}</span>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-1 mt-0.5 ${
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
          
          <div className="space-y-2 py-2">
            {allItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-2 rounded bg-secondary/30">
                <span className="text-sm font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleReplenishChange(item.key, -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-6 text-center font-bold text-sm">{replenishItems[item.key] || 0}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleReplenishChange(item.key, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-5">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 rounded bg-warning/10 border border-warning/30">
            <p className="text-sm text-warning font-medium">⚠️ 临时补货费用：¥50</p>
            <p className="text-xs text-muted-foreground">费用将从每周结算自动扣除</p>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowReplenishDialog(false)}>
              取消
            </Button>
            <Button size="sm" onClick={handleSubmitReplenish} className="bg-primary">
              提交审核
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
