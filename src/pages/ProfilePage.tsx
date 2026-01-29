import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Store,
  MessageSquare,
  FileText,
  ChevronRight,
  Award,
  Upload,
  HelpCircle,
  Shield,
} from "lucide-react";

const ProfilePage = () => {
  const userInfo = {
    name: "张三",
    storeName: "KAKAGO 中关村店",
    storeId: "KKG-0012",
    kakaPoints: 2580,
  };

  const menuItems = [
    {
      icon: Store,
      title: "门店资料",
      desc: "上传/修改门店信息",
      badge: null,
    },
    {
      icon: MessageSquare,
      title: "意见反馈",
      desc: "提交问题或建议",
      badge: null,
    },
    {
      icon: FileText,
      title: "签约文件",
      desc: "查看合同与协议",
      badge: "3份",
    },
    {
      icon: Shield,
      title: "隐私政策",
      desc: "数据保护说明",
      badge: null,
    },
    {
      icon: HelpCircle,
      title: "帮助中心",
      desc: "常见问题解答",
      badge: null,
    },
  ];

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Profile Header */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{userInfo.name}</h2>
            <p className="text-muted-foreground text-sm">{userInfo.storeName}</p>
            <Badge variant="outline" className="mt-1">
              门店编号: {userInfo.storeId}
            </Badge>
          </div>
        </div>
      </Card>

      {/* KAKA Points Card */}
      <Card className="glass-card p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-6 h-6 text-primary" />
              <span className="text-muted-foreground">KAKA豆积分</span>
            </div>
            <span className="text-5xl font-bold text-primary">{userInfo.kakaPoints.toLocaleString()}</span>
          </div>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
            积分明细
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          积分可用于兑换奖励和特权
        </p>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button className="touch-target flex-col h-auto py-4 bg-secondary hover:bg-secondary/80">
          <Upload className="w-6 h-6 mb-2" />
          <span>上传门店照片</span>
        </Button>
        <Button className="touch-target flex-col h-auto py-4 bg-secondary hover:bg-secondary/80">
          <MessageSquare className="w-6 h-6 mb-2" />
          <span>联系客服</span>
        </Button>
      </div>

      {/* Menu Items */}
      <Card className="glass-card divide-y divide-border">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <item.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <Badge variant="secondary">{item.badge}</Badge>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        ))}
      </Card>

      {/* Version Info */}
      <p className="text-center text-xs text-muted-foreground">
        KAKAGO 商户端 v1.0.0
      </p>
    </div>
  );
};

export default ProfilePage;
