import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Files,
  ScanFace,
  PenLine,
  Check,
  ChevronLeft,
  Coffee,
  Loader2,
  CheckCircle2,
  Stamp,
  Eraser,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DocumentReader from "@/components/DocumentReader";
import SignaturePad, { SignaturePadHandle } from "@/components/SignaturePad";
import { useOnboarding } from "@/contexts/OnboardingContext";

const STEPS = [
  { label: "阅读主协议", icon: FileText },
  { label: "签署附件组", icon: Files },
  { label: "法人认证", icon: ScanFace },
  { label: "电子签名", icon: PenLine },
];

const mainAgreement = [
  "《KAKAGO 商家入驻合作协议》",
  "本协议由 KAKAGO（以下简称"平台"）与入驻商家（以下简称"商家"）共同签署。商家确认已充分阅读并理解本协议全部条款。",
  "第一条 合作模式：平台为商家提供闲置产能变现的撮合服务，商家保持门店原有价格体系与菜单独立性，平台不强制商家参与任何打折促销活动。",
  "第二条 订单履约：商家须在接单后 5 分钟内开始制作，并按产品 SOP 完成出杯。如遇缺料无法履约，须第一时间通过系统通知客户协商换品或取消。",
  "第三条 品质标准：商家须严格遵守平台统一的品控规范与包材标准，确保每一杯出品符合 KAKAGO 品牌质量要求。",
  "第四条 结算规则：平台采用全自动周结算模式，每周五自动打款至商家绑定账户，结算明细可在「结算管理」中查询，无需手动提现。",
  "第五条 数据与隐私：双方应对合作过程中获取的经营数据、客户信息承担保密义务，未经许可不得向第三方披露。",
  "第六条 证照合规：商家须保证营业执照、食品安全许可证、健康证等证照真实有效，并在有效期内持续合规经营。",
  "第七条 协议变更与终止：任何一方需提前 30 日书面通知对方方可变更或终止本协议，已产生的结算款项应据实结清。",
  "第八条 争议解决：因本协议产生的争议，双方应友好协商解决；协商不成的，提交平台所在地有管辖权的人民法院诉讼解决。",
  "第九条 其他约定：本协议自双方电子签署之日起生效，电子签名与手写签名具有同等法律效力。",
];

const attachmentTabs = [
  {
    key: "A",
    title: "《食品安全责任书》",
    confirmLabel: "同意并签署下一份",
    needSign: true,
    paragraphs: [
      "为保障消费者饮食安全，商家郑重承诺如下：",
      "一、严格落实食品安全主体责任，确保所有原材料来源正规、储存合规、不使用过期变质物料。",
      "二、操作区域每 2 小时清洁消毒一次，所有从业人员持有效健康证上岗。",
      "三、食品安全许可证须在有效期内并于经营场所显著位置公示。",
      "四、如发生食品安全事故，商家承担相应法律责任，并积极配合平台与监管部门处理。",
      "五、本责任书自签署之日起持续有效，直至合作关系终止。",
    ],
  },
  {
    key: "B",
    title: "《供应链补货协议》（三方）",
    confirmLabel: "同意并签署下一份",
    needSign: false,
    threeParty: true,
    paragraphs: [
      "本协议由 KAKAGO 平台、TRIVA 供应链公司与入驻商家三方共同签署。",
      "一、商家通过平台「智能补货」模块下单，由 TRIVA 供应链公司统一配送原材料与包材。",
      "二、补货货款将于每周结算时自动从商家结算款中扣除，明细可查。",
      "三、供应链公司保证物料品质与配送时效，预计到货周期 3-5 天。",
      "四、商家收货时须核对品项、数量并检查保质期，如有异常须 24 小时内反馈。",
      "五、本协议中平台方与供应链方签章如下所示，商家方以电子签名确认。",
    ],
  },
  {
    key: "C",
    title: "《订单履约规范》",
    confirmLabel: "我已阅读并知悉",
    readOnly: true,
    paragraphs: [
      "为保障消费者体验，商家须遵守以下订单履约规范：",
      "一、接单后须在 5 分钟内开始制作，并在出杯后及时点击「制作完成」。",
      "二、严禁无故拒单、超时不接单，连续异常将触发总部关注与考核。",
      "三、如需临时休息，须提前在系统中设置暂停接单，避免产生无法履约的订单。",
      "四、出杯须与订单内容、规格、口味完全一致，确保品质稳定。",
      "五、本规范为知悉性条款，商家点击确认即视为已完整阅读并知悉。",
    ],
  },
  {
    key: "D",
    title: "《开业扶持补充协议》",
    confirmLabel: "同意并签署",
    needSign: true,
    conditional: true,
    paragraphs: [
      "鉴于商家符合平台开业扶持政策条件，特签署本补充协议：",
      "一、平台将在商家正式经营首月提供配送费补贴与流量倾斜扶持。",
      "二、扶持期内商家须保持每日上线接单，达成基础出杯量目标。",
      "三、扶持政策最终解释权归 KAKAGO 平台所有，具体细则以后台同步为准。",
      "四、本补充协议为主协议附件，与主协议具有同等法律效力。",
    ],
  },
];

const SigningChamber = () => {
  const navigate = useNavigate();
  const { setStage } = useOnboarding();

  // Whether HQ flagged this merchant for the support-policy attachment (Tab D)
  const hasSupportPolicy = true;
  const tabs = attachmentTabs.filter((t) => !t.conditional || hasSupportPolicy);

  const [step, setStep] = useState(0);

  // Step 2 state
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [tabDone, setTabDone] = useState<Record<string, boolean>>({});

  // Step 3 state
  const [legalName, setLegalName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [faceState, setFaceState] = useState<"idle" | "scanning" | "success">("idle");

  // Step 4 state
  const padRef = useRef<SignaturePadHandle>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const allTabsDone = tabs.every((t) => tabDone[t.key]);
  const idValid = legalName.trim().length >= 2 && /^\d{17}[\dXx]$/.test(idNumber.trim());

  const completeTab = (key: string) => {
    const next = { ...tabDone, [key]: true };
    setTabDone(next);
    // Auto-advance to the next incomplete tab
    const remaining = tabs.find((t) => !next[t.key]);
    if (remaining) setActiveTab(remaining.key);
  };

  const startFaceScan = () => {
    setFaceState("scanning");
    setTimeout(() => setFaceState("success"), 3000);
  };

  const handleFinalSubmit = () => {
    setStage("activation");
    navigate("/");
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} className="text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
            <Coffee className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-[15px] font-bold text-foreground">Kakago 电子签约舱</h1>
          <p className="text-[11px] text-muted-foreground">完成签署以正式激活店铺</p>
        </div>
      </div>

      {/* Steps progress */}
      <div className="flex items-center px-4 py-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const complete = i < step;
          return (
            <div key={s.label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-bold transition-colors ${
                    complete
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`whitespace-nowrap text-[10px] ${active || complete ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {i + 1}.{s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-1 h-px flex-1 ${complete ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col overflow-hidden px-4 pb-4">
        {/* ===== Panel 1: Main agreement ===== */}
        {step === 0 && (
          <DocumentReader
            paragraphs={mainAgreement}
            seconds={10}
            confirmLabel="同意并签署下一页"
            showDownload
            onConfirm={() => setStep(1)}
          />
        )}

        {/* ===== Panel 2: Attachment group ===== */}
        {step === 1 && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Tabs */}
            <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
              {tabs.map((t) => {
                const done = tabDone[t.key];
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                      isActive
                        ? "border-primary bg-primary/15 text-primary"
                        : done
                          ? "border-primary/30 bg-secondary/40 text-foreground"
                          : "border-border bg-secondary/40 text-muted-foreground"
                    }`}
                  >
                    {done && <CheckCircle2 className="h-3 w-3 text-primary" />}
                    {t.key}
                  </button>
                );
              })}
            </div>

            {tabs.map((t) =>
              activeTab === t.key ? (
                <div key={t.key} className="flex flex-1 flex-col overflow-hidden">
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
                    {t.title}
                    {t.needSign && (
                      <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">需签名</span>
                    )}
                    {t.readOnly && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">仅需阅读</span>
                    )}
                  </h3>
                  <DocumentReader
                    key={t.key}
                    paragraphs={t.paragraphs}
                    seconds={10}
                    confirmLabel={t.confirmLabel}
                    done={tabDone[t.key]}
                    onConfirm={() => completeTab(t.key)}
                    topContent={
                      t.threeParty ? (
                        <div className="mb-3 flex gap-3">
                          {["TRIVA 供应链", "KAKAGO 平台"].map((name) => (
                            <div
                              key={name}
                              className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-destructive/40 bg-destructive/5 py-2"
                            >
                              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-destructive text-destructive">
                                <Stamp className="h-6 w-6" />
                              </div>
                              <span className="text-[10px] text-destructive">{name}（已盖章）</span>
                            </div>
                          ))}
                          <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2">
                            <span className="text-[10px] text-muted-foreground">商家方</span>
                            <span className="text-[10px] text-muted-foreground">待电子签名</span>
                          </div>
                        </div>
                      ) : undefined
                    }
                  />
                </div>
              ) : null,
            )}

            <Button
              className="mt-3 h-11 w-full bg-primary font-bold"
              disabled={!allTabsDone}
              onClick={() => setStep(2)}
            >
              {allTabsDone ? "全部附件已签署，下一步" : `请完成全部附件签署 (${Object.values(tabDone).filter(Boolean).length}/${tabs.length})`}
            </Button>
          </div>
        )}

        {/* ===== Panel 3: Legal person auth ===== */}
        {step === 2 && (
          <div className="flex flex-1 flex-col">
            <div className="mb-4 rounded-xl border border-border bg-secondary/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ScanFace className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">法人实名认证</h3>
              </div>
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                请填写企业法人信息并完成人脸识别，以确认签约主体身份真实有效。
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">法人姓名</Label>
                <Input
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="请输入法人姓名"
                  className="h-10"
                  disabled={faceState === "success"}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">身份证号</Label>
                <Input
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="请输入 18 位身份证号"
                  className="h-10"
                  maxLength={18}
                  disabled={faceState === "success"}
                />
              </div>
            </div>

            {faceState === "success" ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-[13px] font-medium text-foreground">人脸识别成功，身份校验一致</span>
              </div>
            ) : (
              <Button
                className="mt-4 h-12 w-full bg-primary text-base font-bold"
                disabled={!idValid}
                onClick={startFaceScan}
              >
                <ScanFace className="mr-2 h-5 w-5" />
                {idValid ? "唤起人脸识别" : "请完整填写法人信息"}
              </Button>
            )}

            <div className="flex-1" />
            <Button
              className="h-12 w-full bg-primary text-base font-bold"
              disabled={faceState !== "success"}
              onClick={() => setStep(3)}
            >
              下一步：电子签名
            </Button>
          </div>
        )}

        {/* ===== Panel 4: Signature ===== */}
        {step === 3 && (
          <div className="flex flex-1 flex-col">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">手写电子签名</h3>
                <p className="text-[11px] text-muted-foreground">请在下方区域签署您的姓名</p>
              </div>
              <button
                onClick={() => padRef.current?.clear()}
                className="flex items-center gap-1 rounded-md bg-secondary/60 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <Eraser className="h-3.5 w-3.5" />
                清除重写
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-xl border border-dashed border-primary/40">
              <SignaturePad ref={padRef} onChange={setHasSignature} />
              {!hasSignature && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="text-sm text-muted-foreground/40">在此手写签名</span>
                </div>
              )}
            </div>

            <Button
              className="mt-4 h-12 w-full bg-primary text-base font-bold"
              disabled={!hasSignature}
              onClick={handleFinalSubmit}
            >
              <Check className="mr-2 h-5 w-5" />
              确认提交
            </Button>
          </div>
        )}
      </div>

      {/* Face recognition overlay */}
      <AnimatePresence>
        {faceState === "scanning" && (
          <motion.div
            className="fixed inset-0 z-[140] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative mb-6">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10">
                <ScanFace className="h-14 w-14 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">正在唤起人脸识别…</span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">请将面部正对屏幕，保持光线充足</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SigningChamber;
