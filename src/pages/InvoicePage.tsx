import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Building2,
  User,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type InvoiceStatus = "all" | "pending" | "completed" | "rejected";

interface InvoiceRequest {
  id: string;
  orderNo: string;
  amount: number;
  titleType: "personal" | "enterprise";
  companyName?: string;
  taxNumber?: string;
  customerEmail?: string;
  status: "pending" | "completed" | "rejected";
  createdAt: string;
  invoiceUrl?: string;
  rejectReason?: string;
}

const mockInvoices: InvoiceRequest[] = [
  {
    id: "1",
    orderNo: "K20240301001",
    amount: 256,
    titleType: "enterprise",
    companyName: "北京科技有限公司",
    taxNumber: "91110108MA01XXXX",
    customerEmail: "zhang@tech.com",
    status: "pending",
    createdAt: "2024-03-01 14:30",
  },
  {
    id: "2",
    orderNo: "K20240228015",
    amount: 89,
    titleType: "personal",
    customerEmail: "li@mail.com",
    status: "pending",
    createdAt: "2024-02-28 10:15",
  },
  {
    id: "3",
    orderNo: "K20240227008",
    amount: 420,
    titleType: "enterprise",
    companyName: "上海文化传媒",
    taxNumber: "91310115MA01YYYY",
    customerEmail: "wang@media.com",
    status: "completed",
    createdAt: "2024-02-27 16:45",
    invoiceUrl: "https://invoice.example.com/download/abc123",
  },
  {
    id: "4",
    orderNo: "K20240226003",
    amount: 35,
    titleType: "personal",
    customerEmail: "zhao@qq.com",
    status: "rejected",
    createdAt: "2024-02-26 09:20",
    rejectReason: "订单金额低于最低开票限额",
  },
  {
    id: "5",
    orderNo: "K20240225012",
    amount: 188,
    titleType: "enterprise",
    companyName: "杭州咖啡贸易",
    taxNumber: "91330100MA01ZZZZ",
    status: "completed",
    createdAt: "2024-02-25 11:00",
    invoiceUrl: "https://tax.example.com/inv/def456",
  },
];

const tabs: { key: InvoiceStatus; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待处理" },
  { key: "completed", label: "已完成" },
  { key: "rejected", label: "已驳回" },
];

const InvoicePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<InvoiceStatus>("all");
  const [invoices, setInvoices] = useState<InvoiceRequest[]>(mockInvoices);

  // Issue dialog
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRequest | null>(null);
  const [invoiceLink, setInvoiceLink] = useState("");

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectInvoice, setRejectInvoice] = useState<InvoiceRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredInvoices = activeTab === "all"
    ? invoices
    : invoices.filter((inv) => inv.status === activeTab);

  const pendingCount = invoices.filter((i) => i.status === "pending").length;
  const totalCompleted = invoices
    .filter((i) => i.status === "completed")
    .reduce((sum, i) => sum + i.amount, 0);
  const todayPendingAmount = invoices
    .filter((i) => i.status === "pending")
    .reduce((sum, i) => sum + i.amount, 0);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label}已复制` });
  };

  const validateUrl = (url: string) => {
    return /^https?:\/\/.+/i.test(url);
  };

  const handleOpenIssue = (inv: InvoiceRequest) => {
    setSelectedInvoice(inv);
    setInvoiceLink("");
    setIssueDialogOpen(true);
  };

  const handleSubmitInvoice = () => {
    if (!selectedInvoice) return;
    if (!validateUrl(invoiceLink)) {
      toast({ title: "链接格式无效", description: "请输入以 http:// 或 https:// 开头的有效链接", variant: "destructive" });
      return;
    }
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === selectedInvoice.id
          ? { ...inv, status: "completed" as const, invoiceUrl: invoiceLink, }
          : inv
      )
    );
    setIssueDialogOpen(false);
    toast({ title: "开票完成", description: "发票链接已提交，将推送至消费者端" });
  };

  const handleOpenReject = (inv: InvoiceRequest) => {
    setRejectInvoice(inv);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectInvoice || !rejectReason.trim()) return;
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === rejectInvoice.id
          ? { ...inv, status: "rejected" as const, rejectReason: rejectReason }
          : inv
      )
    );
    setRejectDialogOpen(false);
    toast({ title: "已驳回", description: "驳回理由已同步至消费者" });
  };

  const statusConfig = {
    pending: { label: "待处理", icon: Clock, className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    completed: { label: "已完成", icon: CheckCircle2, className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    rejected: { label: "已驳回", icon: XCircle, className: "bg-destructive/20 text-destructive border-destructive/30" },
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-[17px] font-bold text-foreground">开票管理</h1>
        </div>
      </div>

      {/* Asset Dashboard */}
      <div className="px-4 pt-4 pb-2">
        <div className="grid grid-cols-3 gap-2">
          <Card className="glass-card p-3 text-center">
            <p className="text-[11px] text-muted-foreground mb-1">待处理</p>
            <p className="text-[22px] font-extrabold text-primary">{pendingCount}</p>
            <p className="text-[11px] text-muted-foreground">笔</p>
          </Card>
          <Card className="glass-card p-3 text-center">
            <p className="text-[11px] text-muted-foreground mb-1">累计开票</p>
            <p className="text-[22px] font-extrabold text-primary">¥{totalCompleted.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">总额</p>
          </Card>
          <Card className="glass-card p-3 text-center">
            <p className="text-[11px] text-muted-foreground mb-1">今日待处理</p>
            <p className="text-[22px] font-extrabold text-primary">¥{todayPendingAmount.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">总额</p>
          </Card>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex mx-4 mt-2 mb-3 bg-secondary/40 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {tab.label}
            {tab.key === "pending" && pendingCount > 0 && (
              <span className="ml-1 text-[11px]">({pendingCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <div className="px-4 space-y-2.5">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">暂无开票记录</div>
        ) : (
          filteredInvoices.map((inv) => {
            const sc = statusConfig[inv.status];
            const StatusIcon = sc.icon;
            return (
              <Card key={inv.id} className="glass-card p-3 space-y-2.5">
                {/* Top row: order no + status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[13px] font-bold text-foreground truncate">
                      {inv.orderNo}
                    </span>
                    <button onClick={() => copyText(inv.orderNo, "订单号")} className="shrink-0">
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                  <Badge className={`text-[10px] px-2 py-0.5 border ${sc.className}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {sc.label}
                  </Badge>
                </div>

                {/* Invoice info */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">开票金额</span>
                    <span className="text-[15px] font-bold text-foreground">¥{inv.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">抬头类型</span>
                    <div className="flex items-center gap-1.5">
                      {inv.titleType === "enterprise" ? (
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span className="text-[13px] text-foreground">
                        {inv.titleType === "enterprise" ? "企业" : "个人"}
                      </span>
                    </div>
                  </div>
                  {inv.titleType === "enterprise" && inv.companyName && (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-muted-foreground">企业名称</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] text-foreground truncate max-w-[180px]">{inv.companyName}</span>
                        <button onClick={() => copyText(inv.companyName!, "企业名称")}>
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  )}
                  {inv.titleType === "enterprise" && inv.taxNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-muted-foreground">税号</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[12px] text-foreground">{inv.taxNumber}</span>
                        <button onClick={() => copyText(inv.taxNumber!, "税号")}>
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">提交时间</span>
                    <span className="text-[12px] text-muted-foreground">{inv.createdAt}</span>
                  </div>
                </div>

                {/* Status-specific info & actions */}
                {inv.status === "pending" && (
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1 h-9 text-[13px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => handleOpenIssue(inv)}
                    >
                      去开票
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 text-[13px] text-muted-foreground border-border"
                      onClick={() => handleOpenReject(inv)}
                    >
                      驳回
                    </Button>
                  </div>
                )}

                {inv.status === "completed" && inv.invoiceUrl && (
                  <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[12px] text-emerald-400 truncate flex-1">{inv.invoiceUrl}</span>
                    <button onClick={() => copyText(inv.invoiceUrl!, "发票链接")}>
                      <Copy className="w-3 h-3 text-emerald-400" />
                    </button>
                  </div>
                )}

                {inv.status === "rejected" && inv.rejectReason && (
                  <div className="px-2.5 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-[12px] text-destructive">驳回理由：{inv.rejectReason}</p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Issue Invoice Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent className="bg-background border-border max-w-[92vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px]">开具发票</DialogTitle>
            <DialogDescription className="text-[12px]">
              请在外部平台开具发票后，将下载链接粘贴至下方
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-3">
              {/* Auto-filled info */}
              <div className="space-y-2 rounded-lg bg-secondary/40 p-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">发票信息（可复制）</p>
                <InfoRow label="订单号" value={selectedInvoice.orderNo} onCopy={() => copyText(selectedInvoice.orderNo, "订单号")} mono />
                <InfoRow label="金额" value={`¥${selectedInvoice.amount}`} />
                <InfoRow label="抬头类型" value={selectedInvoice.titleType === "enterprise" ? "企业" : "个人"} />
                {selectedInvoice.companyName && (
                  <InfoRow label="企业名称" value={selectedInvoice.companyName} onCopy={() => copyText(selectedInvoice.companyName!, "企业名称")} />
                )}
                {selectedInvoice.taxNumber && (
                  <InfoRow label="税号" value={selectedInvoice.taxNumber} onCopy={() => copyText(selectedInvoice.taxNumber!, "税号")} mono />
                )}
                {selectedInvoice.customerEmail && (
                  <InfoRow label="邮箱" value={selectedInvoice.customerEmail} onCopy={() => copyText(selectedInvoice.customerEmail!, "邮箱")} />
                )}
              </div>

              {/* Link input */}
              <div className="space-y-1.5">
                <label className="text-[12px] text-muted-foreground font-medium">发票下载链接</label>
                <Input
                  placeholder="粘贴发票下载链接（https://...）"
                  value={invoiceLink}
                  onChange={(e) => setInvoiceLink(e.target.value)}
                  className="h-10 text-[13px]"
                />
                <p className="text-[10px] text-muted-foreground">支持 http:// 或 https:// 开头的有效链接</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              className="w-full bg-primary"
              disabled={!invoiceLink.trim()}
              onClick={handleSubmitInvoice}
            >
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-background border-border max-w-[92vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px]">驳回开票申请</DialogTitle>
            <DialogDescription className="text-[12px]">
              订单 {rejectInvoice?.orderNo}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="请输入驳回理由..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[80px] text-[13px]"
          />
          <DialogFooter>
            <Button
              className="w-full"
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={handleConfirmReject}
            >
              确认驳回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for issue dialog info rows
const InfoRow = ({
  label,
  value,
  onCopy,
  mono,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  mono?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-[12px] text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className={`text-[12px] text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
      {onCopy && (
        <button onClick={onCopy}>
          <Copy className="w-3 h-3 text-muted-foreground hover:text-primary transition-colors" />
        </button>
      )}
    </div>
  </div>
);

export default InvoicePage;
