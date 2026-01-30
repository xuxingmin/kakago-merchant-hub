import { useState, useRef, ReactNode } from "react";
import { Undo2 } from "lucide-react";

interface SwipeableOrderCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  enabled?: boolean;
}

const SwipeableOrderCard = ({ children, onSwipeLeft, enabled = true }: SwipeableOrderCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [showUndo, setShowUndo] = useState(false);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enabled) return;
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enabled || !isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Only allow left swipe (negative diff)
    if (diff < 0) {
      setTranslateX(Math.max(diff, -100));
      setShowUndo(diff < -50);
    }
  };

  const handleTouchEnd = () => {
    if (!enabled) return;
    isDragging.current = false;
    
    if (translateX < -60 && onSwipeLeft) {
      onSwipeLeft();
    }
    
    setTranslateX(0);
    setShowUndo(false);
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Undo background */}
      <div 
        className={`absolute inset-0 bg-blue-500 flex items-center justify-end pr-4 transition-opacity ${
          showUndo ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 text-white">
          <Undo2 className="w-5 h-5" />
          <span className="text-sm font-bold">撤回</span>
        </div>
      </div>
      
      {/* Card content */}
      <div
        className="relative bg-secondary/50 border border-border px-2 py-1.5 transition-transform"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableOrderCard;
