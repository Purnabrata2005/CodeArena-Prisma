import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProblemStore } from "@/store/useProblemStore";
import { useAuthStore } from "@/store/useAuthStore";
import PageLoderLoti from "@/assets/pageLoderLoti";
import {
  Trophy,
  Crown,
  Search,
  Medal,
  Code2,
  Sparkles,
  ArrowUpRight,
  Award,
} from "lucide-react";
import { Avatar } from "@heroui/react";
import { Input } from "@/components/ui/input";
import type { LeaderboardEntry } from "@/lib/schemas/problemSchema";
import SEO from "@/components/shared/SEO";

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") ?? "U";

interface PodiumCardProps {
  entry: LeaderboardEntry | undefined;
  place: 1 | 2 | 3;
}

const PodiumCard = ({ entry, place }: PodiumCardProps) => {
  const config = {
    1: {
      height: "h-80 md:h-[370px]",
      order: "md:order-2",
      icon: <Crown className="h-5 w-5 text-yellow-400 animate-pulse" />,
      label: "Champion",
      ring: "ring-2 ring-yellow-400/60 shadow-[0_0_20px_rgba(234,179,8,0.3)]",
      glow: "shadow-[0_20px_50px_rgba(234,179,8,0.15)]",
      badge: "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black border border-yellow-300/30",
      accent: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      gradient: "from-yellow-500/10 via-transparent to-transparent",
      glowColor: "rgba(234, 179, 8, 0.2)",
      avatarBorder: "border-yellow-400/40",
    },
    2: {
      height: "h-68 md:h-[310px]",
      order: "md:order-1",
      icon: <Medal className="h-4 w-4 text-slate-300" />,
      label: "Runner-up",
      ring: "ring-2 ring-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.2)]",
      glow: "shadow-[0_15px_35px_rgba(148,163,184,0.15)]",
      badge: "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 text-white border border-slate-300/20",
      accent: "text-slate-300 bg-slate-300/10 border-slate-300/20",
      gradient: "from-slate-400/5 via-transparent to-transparent",
      glowColor: "rgba(148, 163, 184, 0.15)",
      avatarBorder: "border-slate-400/30",
    },
    3: {
      height: "h-60 md:h-[270px]",
      order: "md:order-3",
      icon: <Award className="h-4 w-4 text-amber-600" />,
      label: "3rd Place",
      ring: "ring-2 ring-amber-600/40 shadow-[0_0_15px_rgba(217,119,6,0.25)]",
      glow: "shadow-[0_15px_35px_rgba(217,119,6,0.08)]",
      badge: "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white border border-amber-500/20",
      accent: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      gradient: "from-amber-600/5 via-transparent to-transparent",
      glowColor: "rgba(217, 119, 6, 0.1)",
      avatarBorder: "border-amber-600/30",
    },
  }[place];

  if (!entry) {
    return (
      <div
        className={`${config.order} flex flex-col items-center w-full animate-fade-in-up`}
        style={{
          animationDelay: `${place * 120}ms`,
          animationFillMode: "both",
        }}
      >
        {/* Empty Avatar Slot */}
        <div className="relative mb-4">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center bg-muted/5 backdrop-blur-xs">
            <span className="text-xl md:text-2xl font-bold text-muted-foreground/30 font-mono">#{place}</span>
          </div>
        </div>

        {/* Empty Pedestal */}
        <div className={`${config.height} w-full rounded-2xl border border-dashed border-border/60 bg-gradient-to-b from-card/30 to-transparent flex flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:border-border/90 relative overflow-hidden`}>
          <div className="p-2.5 rounded-full bg-muted/10 text-muted-foreground/30 mb-3">
            {config.icon}
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/40 mb-1">{config.label}</p>
          <p className="text-xs font-semibold text-muted-foreground/50">Awaiting Challenger</p>
          <div className="mt-4 text-[9px] text-muted-foreground/40 px-2.5 py-1 rounded-full bg-muted/5 border border-border/40">
            Claim this rank
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${config.order} flex flex-col items-center group w-full animate-fade-in-up`}
      style={{
        animationDelay: `${place * 120}ms`,
        animationFillMode: "both",
      }}
    >
      {/* Avatar */}
      <div className="relative mb-4 z-10 group-hover:scale-105 transition-transform duration-300">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${config.gradient} blur-xl opacity-60 scale-125 group-hover:scale-150 transition-transform duration-500`} />
        <div className={`relative rounded-full ${config.ring} p-0.5 bg-background`}>
          <Avatar className="h-20 w-20 md:h-24 md:w-24 text-lg" color="default" variant="soft">
            <Avatar.Image src={entry.user.avatarUrl} alt={entry.user.name || "User"} />
            <Avatar.Fallback delayMs={600}>
              {getInitials(entry.user.name || "U")}
            </Avatar.Fallback>
          </Avatar>
          <div className={`absolute -top-1 -right-1 ${config.badge} rounded-full h-8 w-8 flex items-center justify-center font-extrabold text-sm shadow-md`}>
            {place}
          </div>
        </div>
      </div>

      {/* Pedestal */}
      <div className={`${config.height} w-full rounded-2xl border border-white/5 bg-gradient-to-b from-card via-card/90 to-card/50 ${config.glow} flex flex-col items-center px-4 py-6 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.5)] relative overflow-hidden`}>
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${config.gradient} blur-3xl opacity-30 group-hover:opacity-50 transition-opacity`} />

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-wider font-bold ${config.accent} mb-4 shadow-sm`}>
          {config.icon}
          <span>{config.label}</span>
        </div>

        <div className="w-full text-center space-y-1 z-10">
          <h3 className="font-bold text-foreground text-center text-sm md:text-base line-clamp-1 max-w-full">
            {entry.user.name || entry.user.username}
          </h3>
          <p className="text-xs text-muted-foreground/80 line-clamp-1 max-w-full">
            @{entry.user.username}
          </p>
        </div>

        {/* Solved stats widget */}
        <div className="mt-auto w-full z-10">
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-background/50 border border-border/40 backdrop-blur-xs shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Code2 className="h-3.5 w-3.5 text-primary/80" />
                Problems
              </span>
              <span className="font-bold text-foreground tabular-nums">{entry.solvedCount}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${place === 1 ? 'from-yellow-400 to-amber-500' : place === 2 ? 'from-slate-300 to-slate-400' : 'from-amber-600 to-amber-700'} transition-all duration-1000 ease-out`}
                style={{
                  width: `${Math.min((entry.solvedCount / 50) * 100, 100)}%`,
                  transitionDelay: "300ms",
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-0.5">
              <span>solved</span>
              <span>{Math.min((entry.solvedCount / 50) * 100, 100).toFixed(0)}% level</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RowProps {
  item: LeaderboardEntry;
  idx: number;
  isSelf: boolean;
}

const Row = ({ item, idx, isSelf }: RowProps) => {
  return (
    <div
      className={`group relative flex items-center gap-3 md:gap-4 px-4 py-3 rounded-xl border transition-all hover:bg-muted/40 animate-fade-in-right ${isSelf
        ? "bg-primary/5 border-primary/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
        : "bg-card/50 border-border/60 hover:border-border"
        }`}
      style={{
        animationDelay: `${Math.min(idx * 25, 300)}ms`,
        animationFillMode: "both",
      }}
    >
      <div className="w-10 text-center font-mono font-semibold text-sm text-muted-foreground tabular-nums">
        {item.rank}
      </div>

      <Avatar className="h-10 w-10 flex-shrink-0" color="default" variant="soft">
        <Avatar.Image src={item.user.avatarUrl} alt={item.user.name || "User"} />
        <Avatar.Fallback delayMs={600}>
          {getInitials(item.user.name || "U")}
        </Avatar.Fallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">
            {item.user.name || item.user.username}
          </p>
          {isSelf && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
              You
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          @{item.user.username}
        </p>
      </div>

      <div className="hidden sm:flex flex-col items-end">
        <div className="flex items-center gap-1.5">
          <Code2 className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-foreground tabular-nums">
            {item.solvedCount}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          solved
        </span>
      </div>

      <Link
        to={`/profile/${item.user.username}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary"
      >
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
};

export default function Leaderboard() {
  const leaderboard = useProblemStore((state) => state.leaderboard);
  const getLeaderboard = useProblemStore((state) => state.getLeaderboard);
  const currentUser = useAuthStore((state) => state.authUser);

  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      await getLeaderboard(55);
      setIsInitialLoading(false);
    };
    fetchLeaderboard();
  }, [getLeaderboard]);

  const sortedLeaderboard = useMemo(
    () => [...leaderboard].sort((a, b) => a.rank - b.rank),
    [leaderboard]
  );

  const topThree = useMemo(() => ({
    first: sortedLeaderboard.find((u) => u.rank === 1),
    second: sortedLeaderboard.find((u) => u.rank === 2),
    third: sortedLeaderboard.find((u) => u.rank === 3),
  }), [sortedLeaderboard]);

  const listUsers = useMemo(
    () => sortedLeaderboard.filter((u) => u.rank > 3),
    [sortedLeaderboard]
  );

  const filteredListUsers = useMemo(() => {
    if (!searchQuery.trim()) return listUsers;
    const q = searchQuery.toLowerCase();
    return listUsers.filter(
      (i) =>
        i.user.name?.toLowerCase().includes(q) ||
        i.user.username?.toLowerCase().includes(q)
    );
  }, [listUsers, searchQuery]);

  if (isInitialLoading && leaderboard.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageLoderLoti />
      </div>
    );
  }



  const myEntry =
    currentUser && sortedLeaderboard.find((x) => x.userId === currentUser.id);
  const showMyPinned = myEntry && myEntry.rank > 3;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SEO 
        title="Leaderboard" 
        description="View the global CoderArena rankings and standings. Compete with programmers worldwide, solve algorithms, and climb the leaderboard." 
        keywords={["CoderArena leaderboard", "global rankings", "coding standings", "top programmers", "competitive programming ranks", "coder arena", "coders arena", "codr arena", "code arena"]}
      />
      {/* Ambient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-12 md:pb-16 pt-0">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 backdrop-blur-sm mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Global Rankings
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-3">
            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              CoderArena Leaderboard
            </span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Compete with developers worldwide. Solve problems, climb ranks, and conquer the Arena.
          </p>
        </div>

        {/* Podium */}
        {sortedLeaderboard.length > 0 && (
          <div className="grid grid-cols-3 gap-3 md:gap-6 mb-16 items-end">
            <PodiumCard entry={topThree.second} place={2} />
            <PodiumCard entry={topThree.first} place={1} />
            <PodiumCard entry={topThree.third} place={3} />
          </div>
        )}

        {/* List section */}
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Arena Standings
              </h2>
              <span className="text-xs text-muted-foreground ml-1">
                ({listUsers.length})
              </span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search competitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/60 border-border focus-visible:ring-primary rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="p-3 md:p-4 space-y-2">
            {showMyPinned && (
              <>
                <Row item={myEntry as LeaderboardEntry} idx={0} isSelf={true} />
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    All competitors
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            {filteredListUsers.length > 0 ? (
              filteredListUsers.map((item, idx) => (
                <Row
                  key={item.userId}
                  item={item}
                  idx={idx}
                  isSelf={!!(currentUser && item.userId === currentUser.id)}
                />
              ))
            ) : searchQuery.trim() ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No competitors match{" "}
                <span className="text-foreground font-medium">
                  "{searchQuery}"
                </span>
              </div>
            ) : listUsers.length === 0 && sortedLeaderboard.length <= 3 ? null : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No competitors found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
