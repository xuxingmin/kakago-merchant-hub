import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  MessageSquare,
  ChevronRight,
  Coffee,
  TrendingUp,
  FileCheck,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ProfilePage = () => {
  const [showStoreSheet, setShowStoreSheet] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showFeedbackSheet, setShowFeedbackSheet] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const userInfo = {
    storeName: "KAKAGO 中关村店",
    role: "店主/咖啡师",
    merchantId: "MCH-88012",
    totalEarnings: 128600,
    totalCups: 6420,
    daysJoined: 128,
  };

  const storeFields = [
    { key: "name", label: "门店名称", placeholder: "输入门店名称" },
    { key: "nameEn", label: "英文名称", placeholder: "Enter store name" },
    { key: "phone", label: "联系电话", placeholder: "输入联系电话" },
    { key: "coordinates", label: "高德地图经纬度", placeholder: "例: 116.397428,39.90923" },
    { key: "address", label: "门店地址", placeholder: "输入详细地址" },
    { key: "barista", label: "首席咖啡师", placeholder: "输入咖啡师姓名" },
    { key: "intro", label: "门店介绍", placeholder: "介绍您的门店特色", multiline: true },
    { key: "message", label: "门店寄语", placeholder: "给顾客的一句话", multiline: true },
  ];

  const uploadFields = [
    { key: "license", label: "营业执照" },
    { key: "foodPermit", label: "食品安全许可证" },
    { key: "healthCert", label: "健康证" },
    { key: "storePhotos", label: "门店照片" },
  ];

  const joinBenefits = [
    "专属供应链支持，原料成本降低30%",
    "KAKAGO品牌授权使用",
    "数字化运营系统全套接入",
    "每周定时补货，无需囤货压力",
    "平台流量扶持与订单分成",
  ];

  return (
    <div className="p-3 pb-20 space-y-3">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground">KAKAGO</h1>
        <p className="text-sm text-primary">可负担的精品咖啡</p>
      </div>

      {/* Top Cards - Identity & Stats */}
      <div className="grid grid-cols-2 gap-2">
        {/* Left - Store Identity */}
        <Card className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{userInfo.storeName}</p>
              <p className="text-xs text-muted-foreground">{userInfo.role}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            商户ID: {userInfo.merchantId}
          </Badge>
        </Card>

        {/* Right - Store Stats */}
        <Card className="glass-card p-3">
          <p className="text-xs text-muted-foreground mb-1">累计收益</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-primary">¥{userInfo.totalEarnings.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-foreground">{userInfo.totalCups}</span>
              <span className="text-[10px] text-muted-foreground">杯</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-foreground">{userInfo.daysJoined}</span>
              <span className="text-[10px] text-muted-foreground">天</span>
            </div>
            <Badge className="bg-success/20 text-success text-[10px]">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +12%
            </Badge>
          </div>
        </Card>
      </div>

      {/* Menu Items */}
      <Card className="glass-card divide-y divide-border">
        {/* Store Profile */}
        <button
          className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
          onClick={() => setShowStoreSheet(true)}
        >
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
            <Store className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">门店资料</p>
            <p className="text-xs text-muted-foreground">上传/修改门店信息</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Join KAKAGO */}
        <button
          className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
          onClick={() => setShowJoinDialog(true)}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <FileCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">加入KAKAGO</p>
            <p className="text-xs text-muted-foreground">加入我们，一起成长</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Feedback */}
        <button
          className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
          onClick={() => setShowFeedbackSheet(true)}
        >
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">意见反馈</p>
            <p className="text-xs text-muted-foreground">提交问题或建议</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </Card>

      {/* Version Info */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        KAKAGO v1.0.0
      </p>

      {/* Store Profile Sheet */}
      <Sheet open={showStoreSheet} onOpenChange={setShowStoreSheet}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[85vh]">
          <SheetHeader className="pb-3">
            <SheetTitle>门店资料</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-80px)] pb-4">
            {/* Text Fields */}
            <div className="space-y-3">
              {storeFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{field.label}</Label>
                  {field.multiline ? (
                    <Textarea placeholder={field.placeholder} className="min-h-[60px] text-sm" />
                  ) : (
                    <Input placeholder={field.placeholder} className="h-9 text-sm" />
                  )}
                </div>
              ))}
            </div>

            {/* Upload Fields */}
            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground font-medium">证照上传</p>
              <div className="grid grid-cols-2 gap-2">
                {uploadFields.map((field) => (
                  <div
                    key={field.key}
                    className="p-4 rounded-lg border border-dashed border-border bg-secondary/20 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/40 transition-colors"
                  >
                    <Store className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">{field.label}</span>
                    <span className="text-[10px] text-primary mt-1">点击上传</span>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full bg-primary mt-4">保存资料</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Join KAKAGO Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-background border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">加入 KAKAGO</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground text-center">
              成为KAKAGO合作商户，享受以下权益：
            </p>
            <div className="space-y-2">
              {joinBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded bg-secondary/30">
                  <span className="text-primary text-sm">✓</span>
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 p-3 rounded bg-primary/10 border border-primary/30">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5"
              />
              <p className="text-xs text-muted-foreground">
                我已阅读并同意《KAKAGO合作商户协议》和《数据保护条款》
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowJoinDialog(false)}>
              取消
            </Button>
            <Button 
              size="sm" 
              className="bg-primary" 
              disabled={!agreedToTerms}
              onClick={() => {
                alert("申请已提交，我们将尽快与您联系！");
                setShowJoinDialog(false);
              }}
            >
              签署并加入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Sheet */}
      <Sheet open={showFeedbackSheet} onOpenChange={setShowFeedbackSheet}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[50vh]">
          <SheetHeader className="pb-3">
            <SheetTitle>意见反馈</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">反馈内容</Label>
              <Textarea placeholder="请描述您遇到的问题或建议..." className="min-h-[120px]" />
            </div>
            <Button className="w-full bg-primary">提交反馈</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProfilePage;
