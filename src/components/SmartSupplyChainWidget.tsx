import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Package, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useActiveRestockShipment, useRestockItems, useConfirmRestockDelivery } from "@/hooks/useInventory";

const SmartSupplyChainWidget = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: activeShipment, isLoading: shipmentLoading } = useActiveRestockShipment();
  const { data: restockItems = [] } = useRestockItems(activeShipment?.id);
  const confirmDelivery = useConfirmRestockDelivery();

  const isRestockActive = !!activeShipment;
  const estimatedDays = activeShipment?.estimated_days || 0;

  const handleWidgetClick = () => {
    if (isRestockActive) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!activeShipment) return;
    
    try {
      await confirmDelivery.mutateAsync(activeShipment.id);
      setIsSuccess(true);
      
      setTimeout(() => {
        setShowConfirmDialog(false);
        setIsSuccess(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to confirm delivery:", error);
    }
  };

  if (shipmentLoading) {
    return (
      <Card className="bg-[#1A1A1A] border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          <span className="text-xs text-muted-foreground">加载中...</span>
        </div>
      </Card>
    );
  }

  // 状态 A: 系统正常 (Idle State)
  if (!isRestockActive) {
    return (
      <Card className="bg-[#1A1A1A] border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-bold text-muted-foreground">KAKAGO</p>
            <p className="text-[10px] text-muted-foreground/60">智能供应链系统</p>
          </div>
        </div>
      </Card>
    );
  }

  // 状态 B: 补货进行中 (Active Restock State)
  return (
    <>
      <Card
        className="relative bg-background border-2 border-primary px-3 py-2 cursor-pointer transition-all hover:border-primary/80 animate-pulse"
        style={{
          boxShadow: "0 0 15px rgba(127, 0, 255, 0.3), inset 0 0 10px rgba(127, 0, 255, 0.1)",
        }}
        onClick={handleWidgetClick}
      >
        {/* 红点通知 */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs font-bold text-foreground">KAKAGO</p>
            <p className="text-[10px] text-primary">
              智能补货 · 约{estimatedDays}天后达
            </p>
          </div>
        </div>
      </Card>

      {/* 补货确认弹窗 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-background border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Package className="w-5 h-5 text-primary" />
              📦 补货签收确认
            </DialogTitle>
            <p className="text-xs text-muted-foreground">Inbound Manifest</p>
          </DialogHeader>

          {/* 清单内容 */}
          <div className="space-y-2 py-3">
            <p className="text-xs text-muted-foreground mb-2">本次补货清单：</p>
            {restockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded bg-secondary/30 border border-border"
              >
                <span className="text-sm font-medium text-foreground">
                  {item.item_name}
                </span>
                <span className="text-sm font-bold text-primary">
                  x {item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* 底部操作区 */}
          <div className="space-y-3">
            <p className="text-[10px] text-muted-foreground text-center">
              请核对实物数量，签收后将自动计入库存。
            </p>
            
            <DialogFooter className="sm:flex-col gap-2">
              <Button
                className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90"
                onClick={handleConfirmReceipt}
                disabled={confirmDelivery.isPending || isSuccess}
              >
                {confirmDelivery.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    处理中...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    入库成功！
                  </>
                ) : (
                  "确认实物无误，一键入库"
                )}
              </Button>
              
              {!confirmDelivery.isPending && !isSuccess && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  稍后处理
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SmartSupplyChainWidget;
