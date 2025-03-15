
import { ReactNode, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  MessageCircle, HeartPulse, BookText, Shield, 
  Settings, Menu, Moon, Sun
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

interface MainLayoutProps {
  children: ReactNode;
  onTabChange?: (tab: string) => void;
}

const MainLayout = ({ children, onTabChange }: MainLayoutProps) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleTabClick = (tab: string) => {
    if (location.pathname === "/" && onTabChange) {
      onTabChange(tab);
    } else {
      navigate(`/?tab=${tab}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-500">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors duration-500">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem asChild>
                  <button onClick={() => handleTabClick("rant")} className="flex items-center gap-2 cursor-pointer w-full">
                    <MessageCircle className="h-4 w-4 text-reflectify-blue" />
                    <span>Express</span>
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button onClick={() => handleTabClick("chat")} className="flex items-center gap-2 cursor-pointer w-full">
                    <HeartPulse className="h-4 w-4 text-reflectify-purple" />
                    <span>Chat</span>
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button onClick={() => handleTabClick("journal")} className="flex items-center gap-2 cursor-pointer w-full">
                    <BookText className="h-4 w-4 text-reflectify-green" />
                    <span>Journal</span>
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button onClick={() => handleTabClick("content")} className="flex items-center gap-2 cursor-pointer w-full">
                    <Shield className="h-4 w-4 text-reflectify-peach" />
                    <span>Analyze</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-reflectify-blue via-reflectify-purple to-reflectify-green">
                <div className="absolute inset-0.5 rounded-full bg-white dark:bg-card flex items-center justify-center transition-colors duration-500">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-reflectify-blue via-reflectify-purple to-reflectify-green font-bold">R</span>
                </div>
              </div>
              <span className="hidden font-display font-medium md:inline-block">Reflectify</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => handleTabClick("rant")} 
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-reflectify-blue" />
              <span>Express</span>
            </button>
            <button 
              onClick={() => handleTabClick("chat")} 
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <HeartPulse className="h-4 w-4 text-reflectify-purple" />
              <span>Chat</span>
            </button>
            <button 
              onClick={() => handleTabClick("journal")} 
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookText className="h-4 w-4 text-reflectify-green" />
              <span>Journal</span>
            </button>
            <button 
              onClick={() => handleTabClick("content")} 
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Shield className="h-4 w-4 text-reflectify-peach" />
              <span>Analyze</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full transition-transform hover:scale-110 duration-500"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 transition-all duration-500" />
              ) : (
                <Moon className="h-5 w-5 transition-all duration-500" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full transition-transform hover:scale-110 duration-500"
              onClick={() => handleNavigate('/settings')}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 transition-colors duration-500">
        {children}
      </main>

      <footer className="border-t border-border/40 py-6 px-4 md:px-6 transition-colors duration-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Reflectify. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
