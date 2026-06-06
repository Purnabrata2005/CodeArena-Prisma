"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { type ReactNode, useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProblemStore } from "@/store/useProblemStore";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import UserButton from "@/components/landing/UserButton";
import StreakLoti from "@/assets/streakLoti";
import { cn } from "@/lib/utils";

interface NavbarProps {
  children?: ReactNode;
}

export default function NavbarDemo({ children }: NavbarProps) {
  const { authUser: user } = useAuthStore();
  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Problems",
      link: "/problems",
    },
    {
      name: "Leaderboard",
      link: "/leaderboard",
    },
    {
      name: "About",
      link: "/about",
    },
    ...(user?.role === "ADMIN"
      ? [
        {
          name: "Add Problem",
          link: "/add-problem",
        },
      ]
      : []),
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userRank = useProblemStore((state) => state.userRank);
  const getUserSolvedProblemsRank = useProblemStore((state) => state.getUserSolvedProblemsRank);

  useEffect(() => {
    if (user?.id && !userRank) {
      getUserSolvedProblemsRank(user.id);
    }
  }, [getUserSolvedProblemsRank, user?.id, userRank]);

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />

          <div className="flex items-center gap-3">
            {user && (
              userRank ? (
                <div
                  id="navbar-streak-widget"
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border bg-card/60 backdrop-blur-sm cursor-help select-none animate-fade-in"
                  title={`Active Streak: ${userRank.streak ?? 0} days`}
                >
                  <StreakLoti
                    className={cn(
                      "size-7 transition-all duration-300",
                      (userRank.streak ?? 0) > 0
                        ? ""
                        : "grayscale opacity-50"
                    )}
                  />
                  <span className={cn(
                    "text-sm font-bold",
                    (userRank.streak ?? 0) > 0 ? "text-orange-500" : "text-muted-foreground opacity-50"
                  )}>
                    {userRank.streak ?? 0}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border bg-card/20 backdrop-blur-sm select-none animate-pulse">
                  <div className="size-7 rounded-full bg-muted" />
                  <div className="w-3 h-4 rounded bg-muted" />
                </div>
              )
            )}
            <ThemeToggle />
            <UserButton />
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative w-full text-center text-muted-foreground"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col items-center gap-4">
              {user && (
                userRank ? (
                  <div
                    className="flex items-center gap-1.5 px-4 py-1 rounded-full border bg-card/60 backdrop-blur-sm select-none animate-fade-in"
                    title={`Active Streak: ${userRank.streak ?? 0} days`}
                  >
                    <StreakLoti
                      className={cn(
                        "size-8 transition-all",
                        (userRank.streak ?? 0) > 0
                          ? ""
                          : "grayscale opacity-50"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-bold",
                      (userRank.streak ?? 0) > 0 ? "text-orange-500" : "text-muted-foreground opacity-50"
                    )}>
                      {userRank.streak ?? 0} days streak
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-4 py-1 rounded-full border bg-card/20 backdrop-blur-sm select-none animate-pulse">
                    <div className="size-8 rounded-full bg-muted" />
                    <div className="w-20 h-4 rounded bg-muted" />
                  </div>
                )
              )}
              <ThemeToggle />
              <UserButton className="self-center" />
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {children}
    </div>
  );
}
