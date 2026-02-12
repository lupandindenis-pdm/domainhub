import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Lock, User, ArrowRight, Loader2, AlertCircle, Shield, KeyRound, X, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const floatingItems = [
  "*.company.com", "dns.resolve()", "ssl:valid",
  "ns1.cloud.net", "CNAME →", "A 192.168.1.1",
  "whois.lookup", "TTL:3600", "mx.mail.io",
];

export default function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const canSubmit = login.trim() !== "" && password.trim() !== "" && !isLoading;

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!canSubmit) return;

      setError("");

      setIsLoading(true);

      // Simulate auth request
      await new Promise((r) => setTimeout(r, 1400));

      if (login.trim() === "admin" && password === "admin") {
        navigate("/");
        return;
      }

      setError("Неверный логин или пароль");
      setIsLoading(false);
    },
    [canSubmit, login, password, navigate],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingItems.map((item, i) => (
          <div
            key={item}
            className="absolute animate-float opacity-[0.06] text-muted-foreground font-mono text-xs"
            style={{
              left: `${(i * 11 + 5) % 95}%`,
              top: `${(i * 13 + 8) % 85}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${10 + i * 1.5}s`,
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Parallax globe */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        <Globe
          className="absolute text-muted-foreground/[0.03]"
          size={800}
          style={{ left: "20%", top: "50%", transform: "translate(-50%, -50%)" }}
        />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ─── LEFT: Creative panel ─── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 xl:p-16 relative z-10">
        <div />

        <div
          className="space-y-6 transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
              Domain Management
            </span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Welcome back
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              to Control
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            Domains don't manage themselves.
          </p>

          {/* Decorative dots */}
          <div className="flex items-center gap-2 pt-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i === 0 ? 24 : 8,
                  backgroundColor: i === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)",
                  transitionDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="flex items-center gap-2 text-xs text-muted-foreground/50 font-mono transition-all duration-700 delay-500"
          style={{ opacity: mounted ? 1 : 0 }}
        >
          <Lock className="h-3 w-3" />
          Authorized access only
        </div>
      </div>

      {/* ─── RIGHT: Login form ─── */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <div
          className="w-full max-w-md transition-all duration-700 delay-200"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)",
          }}
        >
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                Domain Management
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Welcome back
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Domains don't manage themselves.
            </p>
          </div>

          {/* Glass card */}
          <div className="relative rounded-2xl border border-white/[0.06] bg-card/60 backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
            {/* Glow behind card */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">Вход в систему</h2>
                <p className="text-sm text-muted-foreground">
                  Введите данные для доступа
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Login */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Логин
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      type="text"
                      placeholder="Введите логин"
                      value={login}
                      onChange={(e) => { setLogin(e.target.value); setError(""); }}
                      onKeyDown={handleKeyDown}
                      className="pl-10 h-11 bg-muted/30 border-white/[0.06] focus-visible:ring-primary/30 focus-visible:ring-1 focus-visible:ring-offset-0 transition-colors"
                      autoComplete="username"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      onKeyDown={handleKeyDown}
                      className="pl-10 pr-10 h-11 bg-muted/30 border-white/[0.06] focus-visible:ring-primary/30 focus-visible:ring-1 focus-visible:ring-offset-0 transition-colors"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full h-11 gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all duration-300 text-sm font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Вход...
                    </>
                  ) : (
                    <>
                      Войти
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Forgot password */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowForgot(true)}
                >
                  Забыли пароль?
                </button>
              </div>

              {/* Restricted access note */}
              <div className="pt-2 border-t border-white/[0.06]">
                <p className="text-center text-[11px] text-muted-foreground/50 leading-relaxed">
                  Доступ ограничен для не приглашённых пользователей
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot password dialog */}
      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <DialogContent className="max-w-sm border-white/[0.06] bg-card/80 backdrop-blur-xl p-0 overflow-hidden">
          <div className="relative">
            {/* Glow top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="p-8 text-center space-y-5">
              {/* Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <KeyRound className="h-7 w-7 text-primary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  Восстановление доступа
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Для восстановления пароля обратитесь к руководителю проекта.
                  Самостоятельный сброс пароля недоступен.
                </p>
              </div>

              <div className="inline-block px-4 py-2 bg-muted/40 rounded-lg border border-white/[0.06]">
                <p className="text-xs text-muted-foreground font-mono">
                  support → project.lead
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full border-white/[0.08] hover:bg-muted/50"
                onClick={() => setShowForgot(false)}
              >
                Понятно
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float { animation: float linear infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient 4s ease infinite; }
      `}</style>
    </div>
  );
}
