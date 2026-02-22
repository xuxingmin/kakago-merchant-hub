import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Package, Phone, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import SmartSupplyChainWidget from "@/components/SmartSupplyChainWidget";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STORE_ID = "00000000-0000-0000-0000-000000000001";

interface RawMaterial {
  id: string;
  name: string;
  icon: string;
  unit: string;
  current_amount: number;
  max_amount: number;
  usage_per_cup: number;
}

interface PackagingMaterial {
  id: string;
  name: string;
  current_amount: number;
  max_amount: number;
}

const InventoryPage = () => {
  const [showReplenishDialog, setShowReplenishDialog] = useState(false);
  const [replenishItems, setReplenishItems] = useState<Record<string, number>>({});

  const { data: rawMaterials = [] } = useQuery<RawMaterial[]>({
    queryKey: ["raw_materials", STORE_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_materials")
        .select("*")
        .eq("store_id", STORE_ID);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: packagingMaterials = [] } = useQuery<PackagingMaterial[]>({
    queryKey: ["packaging_materials", STORE_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packaging_materials")
        .select("*")
        .eq("store_id", STORE_ID);
      if (error) throw error;
      return data || [];
    },
  });

  // Fallback data when DB is empty (not logged in / no data yet)
  const fallbackRaw: RawMaterial[] = [
    { id: "fb-milk", name: "牛奶", icon: "Milk", unit: "L", current_amount: 15, max_amount: 50, usage_per_cup: 0.2 },
    { id: "fb-beans", name: "咖啡豆", icon: "Coffee", unit: "kg", current_amount: 8, max_amount: 20, usage_per_cup: 0.015 },
  ];
  const fallbackPkg: PackagingMaterial[] = [
    { id: "fb-1", name: "热杯", current_amount: 60, max_amount: 300 },
    { id: "fb-2", name: "冰杯", current_amount: 80, max_amount: 300 },
    { id: "fb-3", name: "热杯盖", current_amount: 50, max_amount: 300 },
    { id: "fb-4", name: "冰杯盖", current_amount: 70, max_amount: 300 },
    { id: "fb-5", name: "纸袋", current_amount: 100, max_amount: 200 },
    { id: "fb-6", name: "杯套", current_amount: 80, max_amount: 300 },
    { id: "fb-7", name: "杯托", current_amount: 40, max_amount: 200 },
    { id: "fb-8", name: "吸管", current_amount: 200, max_amount: 500 },
    { id: "fb-9", name: "封口贴纸", current_amount: 150, max_amount: 400 },
  ];

  const inventory = rawMaterials.length > 0 ? rawMaterials : fallbackRaw;
  const packaging = packagingMaterials.length > 0 ? packagingMaterials : fallbackPkg;

  const calculateAvailable = () => {
    // Calculate based on raw materials usage_per_cup
    const rawLimits = inventory.map(m => Math.floor(m.current_amount / m.usage_per_cup));
    // Cups and lids as packaging constraint
    const cupsItem = packaging.filter(p => p.name.includes("杯") && !p.name.includes("盖") && !p.name.includes("套") && !p.name.includes("托"));
    const lidsItem = packaging.filter(p => p.name.includes("盖"));
    const cupsLimit = cupsItem.length > 0 ? Math.min(...cupsItem.map(c => c.current_amount)) : Infinity;
    const lidsLimit = lidsItem.length > 0 ? Math.min(...lidsItem.map(l => l.current_amount)) : Infinity;
    return Math.min(...rawLimits, cupsLimit, lidsLimit);
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
    alert("临时补货费用50元，将从每周结算自动扣除。已提交后台审核！");
    setShowReplenishDialog(false);
    setReplenishItems({});
  };

  const allItems = [
    ...inventory.map(m => ({ key: m.id, name: m.name, unit: m.unit })),
    ...packaging.map(m => ({ key: m.id, name: m.name, unit: "个" })),
  ];

  return (
    <div className="p-3 pb-20 space-y-2">
      {/* Available Count */}
      <Card className={`glass-card px-3 py-2 ${isLowStock ? "border-destructive" : "border-success"}`}>
        {isLowStock && (
          <div className="flex items-center gap-1 text-destructive">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs font-bold">库存预警</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">当前可售</p>
          <p className="text-[10px] text-muted-foreground/60">基于库存原材料最低组合计算</p>
        </div>
        <div className="flex items-baseline">
          <span className={`text-2xl font-bold ${isLowStock ? "text-destructive" : "text-success"}`}>
            {availableProducts}
          </span>
          <span className="text-xs text-muted-foreground ml-1">杯</span>
        </div>
      </Card>

      {/* Supply Chain & Emergency Replenish */}
      <div className="grid grid-cols-2 gap-2">
        <SmartSupplyChainWidget 
          isRestockActive={true}
          estimatedDays={6}
          inboundItems={[
            { name: "咖啡豆", quantity: "20kg" },
            { name: "牛奶", quantity: "5盒" },
            { name: "热杯", quantity: "1000个" },
          ]}
        />

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
          <div className="grid grid-cols-3 gap-1.5">
            {inventory.map((item) => {
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
                    <span className="text-[8px] text-muted-foreground">/{item.max_amount} {item.unit}</span>
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

        {/* Packaging Materials */}
        <Card className="glass-card p-3">
          <h3 className="text-xs text-muted-foreground mb-2">包材</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {packaging.map((item) => {
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
