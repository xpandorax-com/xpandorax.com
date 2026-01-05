import { Link, useLocation } from "@remix-run/react";
import { useState } from "react";
import {
  Search,
  User,
  LogOut,
  Settings,
  Menu,
  History,
  Bookmark,
  Video,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "~/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/theme-toggle";
import type { User as UserType } from "lucia";

interface HeaderProps {
  user: UserType | null;
  appName: string;
}

export function Header({ user, appName }: HeaderProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveCamOpen, setLiveCamOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/videos", label: "Videos" },
    { href: "/pictures", label: "Pictures" },
    { href: "/categories", label: "Categories" },
    { href: "/models", label: "Models" },
    { href: "/producers", label: "Producers" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top">
      <div className="container flex h-14 sm:h-16 items-center">
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2 touch-target">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-left">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {appName}
                </span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors touch-target",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}
              
              {/* Mobile Live Cam Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLiveCamOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-3 rounded-lg text-base font-medium transition-colors touch-target text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Video className="h-5 w-5 text-red-500 animate-pulse" />
                <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent font-semibold">
                  Live Cam
                </span>
              </button>
              
              {/* Mobile User Section */}
              <div className="mt-4 pt-4 border-t">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <SheetClose asChild>
                      <Link
                        to="/account"
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground touch-target"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        Account
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/logout"
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10 touch-target"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LogOut className="h-5 w-5" />
                        Log out
                      </Link>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <SheetClose asChild>
                      <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-base font-medium border hover:bg-accent touch-target"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Log in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/register"
                        className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 touch-target"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="mr-4 md:mr-6 flex items-center space-x-2">
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {appName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:gap-4 lg:gap-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {/* Live Cam Button - Desktop */}
          <button
            onClick={() => setLiveCamOpen(true)}
            className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground flex items-center gap-1"
          >
            <Video className="h-4 w-4 text-red-500 animate-pulse" />
            <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent font-semibold">
              Live Cam
            </span>
          </button>
        </nav>

        {/* Right Side Actions */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          {/* Search */}
          <Link
            to="/search"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary touch-target p-2"
          >
            <Search className="h-5 w-5" />
            <span className="hidden sm:inline">Search</span>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative touch-target">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/history" className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    Watch History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/bookmarks" className="cursor-pointer">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Bookmarks
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Menu className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/logout"
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Live Cam Dialog (shared for mobile and desktop) */}
      <Dialog open={liveCamOpen} onOpenChange={setLiveCamOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[900px] p-2 sm:p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-red-500" />
              <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                Live Cam
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-video sm:aspect-[850/528]">
            <iframe
              src="https://cbxyz.com/in/?tour=SHBY&campaign=HGMnE&track=embed&room=xpandorax_com"
              className="absolute inset-0 w-full h-full rounded-lg"
              style={{ border: 'none' }}
              allowFullScreen
              title="Live Cam"
            />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
