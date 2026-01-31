import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Coffee, Loader2, Mail, Lock, User } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("请输入有效的邮箱地址");
const passwordSchema = z.string().min(6, "密码至少需要6个字符");

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const validateField = (field: string, value: string) => {
    try {
      if (field.includes("email")) {
        emailSchema.parse(value);
      } else if (field.includes("password")) {
        passwordSchema.parse(value);
      }
      setErrors(prev => ({ ...prev, [field]: "" }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0].message }));
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValid = validateField("loginEmail", loginEmail);
    const passwordValid = validateField("loginPassword", loginPassword);
    
    if (!emailValid || !passwordValid) return;
    
    setIsLoading(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    setIsLoading(false);
    
    if (error) {
      let errorMessage = "登录失败，请稍后重试";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "邮箱或密码错误";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "请先验证您的邮箱";
      }
      toast({
        title: "登录失败",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "登录成功",
      description: "欢迎回来！",
    });
    navigate("/");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName.trim()) {
      setErrors(prev => ({ ...prev, signupName: "请输入您的姓名" }));
      return;
    }
    
    const emailValid = validateField("signupEmail", signupEmail);
    const passwordValid = validateField("signupPassword", signupPassword);
    
    if (!emailValid || !passwordValid) return;
    
    setIsLoading(true);
    
    const { error } = await signUp(signupEmail, signupPassword, signupName, "store_staff");
    
    setIsLoading(false);
    
    if (error) {
      let errorMessage = "注册失败，请稍后重试";
      if (error.message.includes("User already registered")) {
        errorMessage = "该邮箱已被注册";
      } else if (error.message.includes("Password")) {
        errorMessage = "密码不符合要求";
      }
      toast({
        title: "注册失败",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "注册成功",
      description: "请查收验证邮件完成注册",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card p-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Coffee className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">KAKAGO 门店端</h1>
          <p className="text-sm text-muted-foreground">店员登录/注册</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="signup">注册</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="请输入邮箱"
                    className="pl-10"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onBlur={() => validateField("loginEmail", loginEmail)}
                  />
                </div>
                {errors.loginEmail && (
                  <p className="text-xs text-destructive">{errors.loginEmail}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="请输入密码"
                    className="pl-10"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onBlur={() => validateField("loginPassword", loginPassword)}
                  />
                </div>
                {errors.loginPassword && (
                  <p className="text-xs text-destructive">{errors.loginPassword}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    登录中...
                  </>
                ) : (
                  "登录"
                )}
              </Button>
            </form>
          </TabsContent>
          
          {/* Signup Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">姓名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="请输入您的姓名"
                    className="pl-10"
                    value={signupName}
                    onChange={(e) => {
                      setSignupName(e.target.value);
                      setErrors(prev => ({ ...prev, signupName: "" }));
                    }}
                  />
                </div>
                {errors.signupName && (
                  <p className="text-xs text-destructive">{errors.signupName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="请输入邮箱"
                    className="pl-10"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    onBlur={() => validateField("signupEmail", signupEmail)}
                  />
                </div>
                {errors.signupEmail && (
                  <p className="text-xs text-destructive">{errors.signupEmail}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="请设置密码（至少6位）"
                    className="pl-10"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    onBlur={() => validateField("signupPassword", signupPassword)}
                  />
                </div>
                {errors.signupPassword && (
                  <p className="text-xs text-destructive">{errors.signupPassword}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    注册中...
                  </>
                ) : (
                  "注册"
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                注册即表示您同意我们的服务条款和隐私政策
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthPage;
