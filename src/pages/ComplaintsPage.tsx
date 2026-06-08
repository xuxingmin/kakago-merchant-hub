import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, AlertTriangle, Upload, ShieldAlert } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import spillPhoto from "@/assets/complaint-spill.jpg";
import icedPhoto from "@/assets/complaint-iced.jpg";

type ComplaintStatus = "pending" | "appealing" | "expired" | "confirmed";

interface Complaint {
  id: string;
  orderNo: string;
  reason: string;
  amount: number;
  photo: string;
  // 收到扣款通知的时间戳，用于计算 48 小时申诉倒计时
  notifiedAt: number;
  status: ComplaintStatus;
}

const APPEAL_WINDOW_MS = 48 * 60 * 60 * 1000;
const now = Date.now();

// 仅展示总部判定为【门店责任 (Merchant)】的客诉单据
const initialComplaints: Complaint[] = [
  {
    id: "c1",
    orderNo: "HF001-260215-0001",
    reason: "外卖泼洒/漏饮",
    amount: 15.0,
    photo: spillPhoto,
    // 剩余约 38 小时 42 分
    notifiedAt: now - (APPEAL_WINDOW_MS - (38 * 60 + 42) * 60 * 1000),
    status: "pending",
  },
  {
    id: "c2",
    orderNo: "HF001-260210-0089",
    reason: "商品错漏/做错",
    amount: 24.0,
    photo: icedPhoto,
    // 已超过 48 小时，逾期未申诉
    notifiedAt: now - (APPEAL_WINDOW_MS + 6 * 60 * 60 * 1000),
    status: "pending",
  },
];

const ComplaintsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [tick, setTick] = useState(0);
  const [appealId, setAppealId] = useState<string | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const [evidenceUploaded, setEvidenceUploaded] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // 每分钟刷新倒计时
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  const getRemaining = (c: Complaint) => {
    const elapsed = Date.now() - c.notifiedAt;
    return APPEAL_WINDOW_MS - elapsed;
  };

  // 计算有效状态：pending 单据若超时则视为逾期
  const effectiveStatus = (c: Complaint): ComplaintStatus => {
    if (c.status === "pending" && getRemaining(c) <= 0) return "expired";
    return c.status;
  };

  const formatRemaining = (ms: number) => {
    const totalMin = Math.max(0, Math.floor(ms / 60000));
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}小时${m}分`;
  };

  const hasActiveAppeal = complaints.some(
    (c) => effectiveStatus(c) === "pending",
  );

  const openAppeal = (id: string) => {
    setAppealId(id);
    setAppealReason("");
    setEvidenceUploaded(false);
  };

  const submitAppeal = () => {
    if (!appealId || !evidenceUploaded || !appealReason.trim()) return;
    setComplaints((prev) =>
      prev.map((c) => (c.id === appealId ? { ...c, status: "appealing" } : c)),
    );
    setAppealId(null);
    toast({
      title: "申诉已提交",
      description: "单据已流转至总部运营二审，请耐心等待审核结果",
    });
  };

  const statusBadge = (s: ComplaintStatus) => {
    switch (s) {
      case "pending":
        return <Badge className="bg-primary/20 text-primary border-0">待处理</Badge>;
      case "appealing":
        return <Badge className="bg-primary text-primary-foreground border-0">申诉中</Badge>;
      case "expired":
        return <Badge className="bg-muted text-muted-foreground border-0">逾期未申诉</Badge>;
      case "confirmed":
        return <Badge className="bg-muted text-muted-foreground border-0">扣款已确认</Badge>;
    }
  };

  return (
    <div className="px-3 pb-24 pt-2 space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-2 py-1">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">客诉违规记录</h1>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
        <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
        <p className="text-[12px] text-foreground leading-relaxed">
          以下为总部判定为<strong className="text-destructive">门店责任</strong>的客诉单据。收到扣款通知后 48 小时内可发起申诉，逾期未操作将自动确认扣款。
        </p>
      </div>

      {complaints.map((c) => {
        const status = effectiveStatus(c);
        const remaining = getRemaining(c);
        return (
          <Card key={c.id} className="glass-card p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[13px] font-semibold text-foreground">
                {c.orderNo}
              </span>
              {statusBadge(status)}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPreviewPhoto(c.photo)}
                className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border"
              >
                <img
                  src={c.photo}
                  alt="客诉凭证照片"
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="w-full h-full object-cover"
                />
              </button>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                  <span className="text-[13px] font-semibold text-foreground">{c.reason}</span>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  预计扣除金额（物料费+二次配送费）
                </p>
                <p className="text-[18px] font-extrabold text-destructive leading-none">
                  ¥{c.amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* 状态相关交互区 */}
            {status === "pending" && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                <span className="text-[12px] text-primary font-medium">
                  申诉剩余时间：{formatRemaining(remaining)}
                </span>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => openAppeal(c.id)}
                >
                  发起申诉
                </Button>
              </div>
            )}

            {status === "expired" && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                <span className="text-[12px] text-muted-foreground">
                  逾期未申诉，扣款已确认
                </span>
                <Button size="sm" disabled className="h-8 text-xs">
                  发起申诉
                </Button>
              </div>
            )}

            {status === "appealing" && (
              <div className="pt-1 border-t border-border/40">
                <span className="text-[12px] text-primary">
                  申诉已提交，等待总部运营二审
                </span>
              </div>
            )}
          </Card>
        );
      })}

      {complaints.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">暂无违规记录</div>
      )}

      {/* 申诉 Sheet */}
      <Sheet open={appealId !== null} onOpenChange={(open) => !open && setAppealId(null)}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[80vh]">
          <SheetHeader className="pb-3">
            <SheetTitle>发起申诉</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-80px)] pb-4">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              请上传店内监控截图或出餐拍照作为反证，并填写申诉理由。提交后单据将流转至总部运营二审。
            </p>

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">上传反证（必填）</p>
              <button
                onClick={() => setEvidenceUploaded(true)}
                className={`w-full p-5 rounded-lg border border-dashed flex flex-col items-center justify-center transition-colors ${
                  evidenceUploaded
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/20 hover:bg-secondary/40"
                }`}
              >
                <Upload className={`w-6 h-6 mb-1 ${evidenceUploaded ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs text-foreground">
                  {evidenceUploaded ? "监控截图已上传 ✓" : "点击上传店内监控截图 / 出餐拍照"}
                </span>
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">申诉理由（必填）</p>
              <Textarea
                placeholder="请说明具体情况，例如：出餐时杯盖已扣紧并拍照留证，泼洒系配送环节造成……"
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!evidenceUploaded || !appealReason.trim()}
              onClick={submitAppeal}
            >
              提交申诉
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 凭证照片预览 */}
      <Sheet open={previewPhoto !== null} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[70vh]">
          <SheetHeader className="pb-3">
            <SheetTitle>客诉凭证照片</SheetTitle>
          </SheetHeader>
          {previewPhoto && (
            <div className="flex items-center justify-center">
              <img
                src={previewPhoto}
                alt="客诉凭证照片"
                loading="lazy"
                width={1024}
                height={1024}
                className="max-h-[55vh] w-auto rounded-lg object-contain"
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 隐藏的红点检测信号供入口使用（通过 localStorage 同步） */}
      <span className="hidden" data-has-active-appeal={hasActiveAppeal} />
    </div>
  );
};

export default ComplaintsPage;
