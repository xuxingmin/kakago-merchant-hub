import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Package, Phone, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import SmartSupplyChainWidget from "@/components/SmartSupplyChainWidget";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Hardcoded store_id for demo
const DEMO_STORE_ID = "00000000-0000-0000-0000-000000000001";

const getStockStatus = (current: number, max: number) => {
  const pct = (current / max) * 100;
  if (pct <= 20) return { color: "destructive" as const, text: "紧缺" };
  if (pct <= 40) return { color: "warning" as const, text: "偏低" };
  return { color: "success" as const, text: "充足" };
};

const badgeClass = (color: "destructive" | "warning" | "success") =>
  color === "destructive"
    ? "border-destructive text-destructive"
    : color === "warning"
    ? "border-warning text-warning"
    : "border-success text-success";

const progressClass = (color: "destructive" | "warning" | "success") =>
  color === "destructive"
    ? "[&>div]:bg-destructive"
    : color === "warning"
    ? "[&>div]:bg-warning"
    : "[&>div]:bg-success";

interface GridItem {
  id: string;
  name: string;
  current: number;
  max: number;
  unit?: string;
}

const InventoryGridCard = ({ item }: { item: GridItem }) => {
  const status = getStockStatus(item.current, item.max);
  const pct = (item.current / item.max) * 100;

  return (
    <div className="p-1.5 rounded bg-secondary/30">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] text-muted-foreground truncate">{item.name}</span>
        <Badge
          variant="outline"
          className={`text-[8px] px-1 py-0 h-3 ${badgeClass(status.color)}`}
        >
          {status.text}
        </Badge>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-sm font-bold">{item.current}</span>
        <span className="text-[8px] text-muted-foreground">
          /{item.max}{item.unit ? ` ${item.unit}` : ""}
        </span>
      </div>
      <Progress
        value={pct}
        className={`h-1 mt-0.5 ${progressClass(status.color)}`}
      />
    </div>
  );
};

const InventoryPage = () => {
  const [showReplenishDialog, setShowReplenishDialog] = useState(false);
  const [replenishItems, setReplenishItems] = useState<Record<string, number>>({});

  const { data: rawMaterials = [], refetch: refetchRaw } = useQuery({
    queryKey: ["raw_materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_materials")
        .select("*")
        .eq("store_id", DEMO_STORE_ID);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: packagingMaterials = [], refetch: refetchPack } = useQuery({
    queryKey: ["packaging_materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packaging_materials")
        .select("*")
        .eq("store_id", DEMO_STORE_ID);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  // Realtime subscription for auto-updates
  useEffect(() => {
    const channel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raw_materials' }, () => refetchRaw())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packaging_materials' }, () => refetchPack())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetchRaw, refetchPack]);

  const rawItems: GridItem[] = rawMaterials.map((r) => ({
    id: r.id,
    name: r.name,
    current: Number(r.current_amount),
    max: Number(r.max_amount),
    unit: r.unit,
  }));

  const packItems: GridItem[] = packagingMaterials.map((p) => ({
    id: p.id,
    name: p.name,
    current: p.current_amount,
    max: p.max_amount,
  }));

  const availableProducts = useMemo(() => {
    if (!rawMaterials.length || !packagingMaterials.length) return 0;
    const rawLimits = rawMaterials.map((r) =>
      Math.floor(Number(r.current_amount) / Number(r.usage_per_cup))
    );
    const packLimits = packagingMaterials.map((p) => p.current_amount);
    return Math.min(...rawLimits, ...packLimits);
  }, [rawMaterials, packagingMaterials]);

  const isLowStock = availableProducts < 50;

  const allItems = [...rawItems, ...packItems];

  const handleReplenishChange = (key: string, delta: number) => {
    setReplenishItems((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const handleSubmitReplenish = () => {
    alert("临时补货费用50元，将从每周结算自动扣除。已提交后台审核！");
    setShowReplenishDialog(false);
    setReplenishItems({});
  };

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

        {/* Raw Materials - Grid format matching packaging */}
        <Card className="glass-card p-3">
          <h3 className="text-xs text-muted-foreground mb-2">原材料</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {rawItems.map((item) => (
              <InventoryGridCard key={item.id} item={item} />
            ))}
          </div>
        </Card>

        {/* Packaging Materials */}
        <Card className="glass-card p-3">
          <h3 className="text-xs text-muted-foreground mb-2">包材</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {packItems.map((item) => (
              <InventoryGridCard key={item.id} item={item} />
            ))}
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
              <div key={item.id} className="flex items-center justify-between p-2 rounded bg-secondary/30">
                <span className="text-sm font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleReplenishChange(item.id, -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-6 text-center font-bold text-sm">
                    {replenishItems[item.id] || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleReplenishChange(item.id, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 rounded bg-warning/10 border border-warning/30">
            <p className="text-sm text-warning font-medium">临时补货费用：¥50</p>
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
