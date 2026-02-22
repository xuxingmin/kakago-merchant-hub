import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Power } from "lucide-react";

const MerchantBanner = () => {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 px-4 py-2">
      <div className="flex items-center">
        <span className="text-base font-bold text-muted-foreground mr-4 shrink-0">
          KAKAGO
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-foreground">中关村店</span>
          <span className="text-[10px] text-muted-foreground">KKG-0012</span>
        </div>
        <div className="ml-auto shrink-0">
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch
              checked={isOnline}
              onCheckedChange={setIsOnline}
              className="scale-75 data-[state=checked]:bg-primary"
            />
            {isOnline ? (
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-xs text-foreground whitespace-nowrap">
                  上线接单中
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 animate-bounce">
                <Power className="w-5 h-5 text-foreground animate-ping" />
                <span className="text-sm font-black text-foreground animate-pulse whitespace-nowrap">
                  上线
                </span>
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );
};

export default MerchantBanner;
