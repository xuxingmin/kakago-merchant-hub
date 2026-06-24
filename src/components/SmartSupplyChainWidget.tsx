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

interface InboundItem {
  name: string;
  quantity: string;
}

interface SmartSupplyChainWidgetProps {
  isRestockActive?: boolean;
  estimatedDays?: number;
  inboundItems?: InboundItem[];
  onConfirmReceipt?: () => void;
}

const SmartSupplyChainWidget = ({
  isRestockActive = true, // 默认为补货进行中状态便于演示
  estimatedDays = 6,
  inboundItems = [
    { name: "咖啡豆", quantity: "20kg" },
    { name: "牛奶", quantity: "5盒" },
    { name: "热杯", quantity: "1000个" },
  ],
  onConfirmReceipt,
}: SmartSupplyChainWidgetProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localRestockActive, setLocalRestockActive] = useState(isRestockActive);

  const handleWidgetClick = () => {
    if (localRestockActive) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmReceipt = async () => {
    setIsLoading(true);
    
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSuccess(true);
    
    // 显示成功状态后关闭弹窗并恢复状态A
    setTimeout(() => {
      setShowConfirmDialog(false);
      setIsSuccess(false);
      setLocalRestockActive(false);
      onConfirmReceipt?.();
    }, 1000);
  };

  // 状态 A: 系统正常 (Idle State)
  if (!localRestockActive) {
    return (
      <Card className="bg-[#1A1A1A] border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-bold text-muted-foreground">TRIVA</p>
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
        className="relative border-2 border-primary px-3 py-2 cursor-pointer transition-all hover:border-primary/80"
        style={{
          boxShadow: "0 0 15px rgba(127, 0, 255, 0.3), inset 0 0 10px rgba(127, 0, 255, 0.1)",
          animation: "breathe-bw 2s ease-in-out infinite",
        }}
        onClick={handleWidgetClick}
      >
        {/* 红点通知 */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs font-bold text-foreground">TRIVA</p>
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
            {inboundItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded bg-secondary/30 border border-border"
              >
                <span className="text-sm font-medium text-foreground">
                  {item.name}
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
                disabled={isLoading || isSuccess}
              >
                {isLoading ? (
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
              
              {!isLoading && !isSuccess && (
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
