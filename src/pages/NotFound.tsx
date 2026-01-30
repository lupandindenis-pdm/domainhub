import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Home, Search, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const floatingDomains = [
    "lost-domain.com",
    "404.net",
    "nowhere.io",
    "missing.dev",
    "void.space",
    "error.zone"
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingDomains.map((domain, index) => (
          <div
            key={domain}
            className="absolute animate-float opacity-10 text-muted-foreground font-mono text-sm"
            style={{
              left: `${(index * 17 + 10) % 90}%`,
              top: `${(index * 23 + 15) % 80}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${8 + index}s`,
            }}
          >
            {domain}
          </div>
        ))}
      </div>

      {/* Parallax globe effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <Globe
          className="absolute text-muted-foreground/5"
          size={600}
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8 px-4 max-w-2xl">
        {/* Animated 404 */}
        <div className="relative">
          <div className="absolute inset-0 blur-3xl opacity-30">
            <div className="text-[12rem] font-black bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent animate-pulse">
              404
            </div>
          </div>
          <h1 className="relative text-[12rem] font-black leading-none bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent animate-gradient">
            404
          </h1>
        </div>

        {/* Error icon with animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <AlertCircle className="h-16 w-16 text-purple-500/30" />
            </div>
            <AlertCircle className="relative h-16 w-16 text-purple-500 animate-bounce" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">
            Домен не найден
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Похоже, этот домен потерялся в цифровом пространстве. 
            Возможно, он был удален или никогда не существовал.
          </p>
          <div className="inline-block px-4 py-2 bg-muted/50 rounded-lg border border-border">
            <code className="text-sm text-destructive font-mono">
              {location.pathname}
            </code>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            <Home className="h-5 w-5" />
            На главную
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/domains")}
            className="gap-2 border-purple-500/30 hover:bg-purple-500/10 transition-all duration-300 transform hover:scale-105"
          >
            <Search className="h-5 w-5" />
            Поиск доменов
          </Button>
        </div>

        {/* Fun fact */}
        <div className="pt-8 text-sm text-muted-foreground italic">
          💡 Интересный факт: Первая ошибка 404 появилась в CERN в 1992 году
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
