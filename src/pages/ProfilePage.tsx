import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  UserPlus,
  ChevronRight,
  Coffee,
  TrendingUp,
  FileCheck,
  FileText,
  Package,
  MessageCircle,
  AlertTriangle,
  Star,
  Shield,
  Zap,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const taskCards = [
  { id: 1, type: "invoice" as const, title: "开票申请", desc: "客户张先生申请开具¥256发票", tag: "开票" },
  { id: 2, type: "inventory" as const, title: "库存预警", desc: "燕麦奶库存不足，剩余12杯用量", tag: "库存", urgent: true },
  { id: 3, type: "interaction" as const, title: "互动提醒", desc: "2条客户评价待回复", tag: "互动" },
  { id: 4, type: "inventory" as const, title: "库存预警", desc: "杯盖库存低于安全值", tag: "库存", urgent: true },
];

const taskTypeConfig = {
  invoice: { icon: FileText, color: "bg-primary/20 text-primary" },
  inventory: { icon: Package, color: "bg-destructive/20 text-destructive" },
  interaction: { icon: MessageCircle, color: "bg-accent/60 text-accent-foreground" },
};

const recentReviews = [
  { rating: 5, comment: "咖啡很香，配送快！", time: "10分钟前" },
  { rating: 4, comment: "口味不错", time: "30分钟前" },
  { rating: 3, comment: "这次有点凉了", time: "1小时前" },
];

const ProfilePage = () => {
  const [showStoreSheet, setShowStoreSheet] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [showTodoSheet, setShowTodoSheet] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [showGuideSheet, setShowGuideSheet] = useState(false);
  const [showSopSheet, setShowSopSheet] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [replyReviewIndex, setReplyReviewIndex] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

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
    {
      icon: Shield,
      title: "独立咖啡守护",
      desc: "抵抗工业化连锁的吞噬，用分布式的力量，捍卫属于独立咖啡馆的生存空间。",
      accent: true,
    },
    {
      icon: Store,
      title: "门店绝对独立",
      desc: "保持原有的价格体系与菜单独立，拒绝平台强制打折。零平台裹挟，无经营负担。",
    },
    {
      icon: Zap,
      title: "闲置产能变现",
      desc: "告别低谷期打苍蝇。精准填补非高峰期产能，为你带来持续、稳定的额外收入。",
    },
    {
      icon: TrendingUp,
      title: "精准用户引流",
      desc: "拒绝一次性羊毛党。为你精准输送真正懂咖啡的高质量客群，沉淀高频复购的死忠粉。",
    },
    {
      icon: Coffee,
      title: "AI 智能托管",
      desc: "统一部署品控与包材。无需操心叫货与营销设置。无入驻门槛，你只管专注萃取出杯。",
    },
  ];

  return (
    <div className="p-3 pb-20 space-y-3">
      {/* Top Cards - Identity & Stats */}
      <div className="grid grid-cols-2 gap-2">
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
        <button
          className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
          onClick={() => setShowTodoSheet(true)}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center relative">
            <FileText className="w-4 h-4 text-primary" />
            {taskCards.some(t => t.urgent) && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-destructive" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">待办清单</p>
            <p className="text-xs text-muted-foreground">{taskCards.length} 项待处理</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
          onClick={() => setShowReviewSheet(true)}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Star className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">客户评价</p>
            <p className="text-xs text-muted-foreground">评分 4.8 · {recentReviews.length} 条新评价</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

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

        <button
          className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
          onClick={() => setShowJoinDialog(true)}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Coffee className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">开启合作</p>
            <p className="text-xs text-muted-foreground">加入我们，一起成长</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
          onClick={() => setShowGuideSheet(true)}
        >
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">经营须知</p>
            <p className="text-xs text-muted-foreground">门店运营规范与注意事项</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
          onClick={() => setShowSopSheet(true)}
        >
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">产品SOP</p>
            <p className="text-xs text-muted-foreground">标准制作流程与品控规范</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
          onClick={() => setShowInviteSheet(true)}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">邀请伙伴加入</p>
            <p className="text-xs text-muted-foreground">邀请店员加入系统，自助上下线</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </Card>

      <p className="text-center text-xs text-muted-foreground pt-2">
        KAKAGO v1.0.0
      </p>

      {/* 经营须知 Sheet */}
      <Sheet open={showGuideSheet} onOpenChange={setShowGuideSheet}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[85vh]">
          <SheetHeader className="pb-3">
            <SheetTitle>经营须知</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 overflow-y-auto max-h-[calc(85vh-80px)] pb-4">
            {[
              { title: "营业时间规范", items: ["每日需在系统设定时间内保持上线状态", "如需临时休息，请提前在系统中设置暂停接单", "连续3天未上线将触发总部关注提醒"] },
              { title: "订单处理要求", items: ["接单后需在5分钟内开始制作", "出杯后及时点击「制作完成」更新状态", "如遇缺料无法制作，立即联系客户协商换品或取消"] },
              { title: "品质管控标准", items: ["严格按照产品SOP执行制作流程", "每日开店前完成设备校准与清洁", "原材料需按规范存储，过期物料严禁使用"] },
              { title: "卫生与安全", items: ["操作区域每2小时清洁消毒一次", "员工需持有效健康证上岗", "食品安全许可证需在有效期内并张贴公示"] },
              { title: "库存管理", items: ["每日盘点核心原材料库存", "库存低于安全线时及时通过智能补货下单", "收货时需核对品项与数量并检查保质期"] },
            ].map((section, i) => (
              <div key={i} className="rounded-xl bg-secondary/40 p-3 space-y-1.5">
                <h4 className="text-sm font-bold text-foreground">{section.title}</h4>
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className="text-primary text-xs mt-0.5">-</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* 产品SOP Sheet */}
      <Sheet open={showSopSheet} onOpenChange={setShowSopSheet}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[85vh]">
          <SheetHeader className="pb-3">
            <SheetTitle>产品SOP</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 overflow-y-auto max-h-[calc(85vh-80px)] pb-4">
            {[
              { name: "经典美式", steps: ["研磨咖啡豆 18g（中细研磨）", "萃取浓缩 36ml / 25-30秒", "加入热水至 240ml（水温92-96度）", "轻轻搅拌均匀，装杯出品"] },
              { name: "拿铁", steps: ["研磨咖啡豆 18g（中细研磨）", "萃取浓缩 36ml / 25-30秒", "打发牛奶至 60-65度，绵密微泡", "注入牛奶至 360ml，拉花出品"] },
              { name: "冰美式", steps: ["研磨咖啡豆 18g（中细研磨）", "萃取浓缩 36ml / 25-30秒", "杯中加满冰块（约200g）", "注入冷水至 360ml，搅拌出品"] },
              { name: "燕麦拿铁", steps: ["研磨咖啡豆 18g（中细研磨）", "萃取浓缩 36ml / 25-30秒", "打发燕麦奶至 60-65度", "注入燕麦奶至 360ml，拉花出品"] },
              { name: "春季特调（花魁拼配）", steps: ["研磨花魁拼配豆 20g（中研磨）", "萃取浓缩 40ml / 28-32秒", "加入风味糖浆 10ml", "打发牛奶注入至 360ml，撒干花装饰"] },
            ].map((product, i) => (
              <div key={i} className="rounded-xl bg-secondary/40 p-3 space-y-1.5">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-primary" />
                  {product.name}
                </h4>
                {product.steps.map((step, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className="text-[11px] font-bold text-primary w-4 shrink-0">{j + 1}.</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Store Profile Sheet */}
      <Sheet open={showStoreSheet} onOpenChange={setShowStoreSheet}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[85vh]">
          <SheetHeader className="pb-3">
            <SheetTitle>门店资料</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-80px)] pb-4">
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

      {/* Join KAKAGO Sheet */}
      <Sheet open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[90vh]">
          <div className="overflow-y-auto max-h-[calc(90vh-20px)] pb-6">
            {/* Hero */}
            <div className="relative bg-gradient-to-b from-primary/20 via-background to-background pt-5 pb-2 px-4 text-center -mx-6 -mt-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-1.5">
                <Coffee className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-[17px] font-bold text-foreground mb-0.5">
                接入 KAKAGO 咖啡网络
              </h2>
              <p className="text-xs text-muted-foreground leading-snug max-w-[300px] mx-auto">
                让闲置产能变现，成为全城精品咖啡基础设施。
              </p>
              <div className="flex justify-center gap-2 mt-2.5 flex-wrap">
                {["0 入驻门槛", "稳定收入增量", "保持门店独立"].map((tag, i) => (
                  <span key={i} className="text-[10px] font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2 mt-4">
              {joinBenefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div
                    key={i}
                    className={`rounded-xl px-4 py-3.5 border transition-all ${
                      b.accent
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary/50 border-transparent"
                    }`}
                    style={b.accent ? { boxShadow: '0 0 20px hsl(271 81% 56% / 0.15)' } : undefined}
                  >
                    <h3 className="text-sm font-bold text-foreground mb-1 tracking-tight flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-primary" />
                      {b.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-5.5">{b.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <p className="text-[11px] text-muted-foreground">
                  我已阅读并同意《KAKAGO合作商户协议》和《数据保护条款》
                </p>
              </div>
              <Button
                className="w-full bg-primary"
                disabled={!agreedToTerms}
                onClick={() => { alert("申请已提交，我们将尽快与您联系！"); setShowJoinDialog(false); }}
              >
                <Coffee className="w-4 h-4 mr-1" />
                立即申请接入网络
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <p className="text-center text-[9px] text-muted-foreground/50">
                提交申请后，24小时内将有工作人员与您联系
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 邀请伙伴 Sheet */}
      <Sheet open={showInviteSheet} onOpenChange={setShowInviteSheet}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[60vh]">
          <SheetHeader className="pb-3">
            <SheetTitle>邀请伙伴加入</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 overflow-y-auto max-h-[calc(60vh-80px)] pb-4">
            <p className="text-sm text-muted-foreground">
              邀请门店伙伴注册并加入此系统，让每位店员都可以自主上线/下线，无需老板在场操作。
            </p>
            <div className="space-y-2">
              {["伙伴可自助上线/下线门店", "伙伴可查看并接单", "订单操作记录清晰可追溯", "老板可随时管理伙伴权限"].map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/30">
                  <span className="text-primary text-sm">✓</span>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">伙伴手机号</Label>
              <Input placeholder="输入伙伴手机号" className="h-9 text-sm" />
            </div>
            <Button className="w-full bg-primary">发送邀请</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 待办清单 Sheet */}
      <Sheet open={showTodoSheet} onOpenChange={setShowTodoSheet}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[85vh]">
          <SheetHeader className="pb-3">
            <SheetTitle>待办清单</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 overflow-y-auto max-h-[calc(85vh-80px)] pb-4">
            {taskCards.map(task => {
              const config = taskTypeConfig[task.type];
              const Icon = config.icon;
              return (
                <div key={task.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${task.urgent ? "bg-destructive/10 border border-destructive/20" : "bg-secondary/30"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground">{task.title}</span>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground">{task.tag}</Badge>
                      {task.urgent && <AlertTriangle className="w-3 h-3 text-destructive" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{task.desc}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[11px] h-7 px-3 text-primary shrink-0">去处理</Button>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* 客户评价 Sheet */}
      <Sheet open={showReviewSheet} onOpenChange={setShowReviewSheet}>
        <SheetContent side="bottom" className="bg-background border-t border-border h-[85vh]">
          <SheetHeader className="pb-3">
            <SheetTitle className="flex items-center gap-2">
              客户评价
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-sm font-bold text-foreground">4.8</span>
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-2 overflow-y-auto max-h-[calc(85vh-80px)] pb-4">
            {recentReviews.map((review, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-secondary/20">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex shrink-0">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-3 h-3 ${j < review.rating ? "text-primary fill-primary" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-foreground truncate">{review.comment}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[10px] text-muted-foreground">{review.time}</span>
                  <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-primary" onClick={() => setReplyReviewIndex(i)}>回复</Button>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* 回复评价 Dialog */}
      <Dialog open={replyReviewIndex !== null} onOpenChange={(open) => { if (!open) { setReplyReviewIndex(null); setReplyText(""); } }}>
        <DialogContent className="bg-background border-border max-w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm">回复评价</DialogTitle>
          </DialogHeader>
          {replyReviewIndex !== null && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-secondary/20">
                <div className="flex shrink-0">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-2.5 h-2.5 ${j < recentReviews[replyReviewIndex].rating ? "text-primary fill-primary" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-xs text-foreground">{recentReviews[replyReviewIndex].comment}</span>
              </div>
              <Textarea
                placeholder="输入回复内容..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                className="min-h-[80px] text-sm bg-secondary/20 border-border"
              />
            </div>
          )}
          <DialogFooter>
            <Button size="sm" className="w-full" onClick={() => { setReplyReviewIndex(null); setReplyText(""); }}>提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
