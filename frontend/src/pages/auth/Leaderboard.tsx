import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProblemStore } from "@/store/useProblemStore";
import { useAuthStore } from "@/store/useAuthStore";
import PageLoderLoti from "@/assets/pageLoderLoti";
import { 
  Trophy, 
  Crown, 
  Search, 
  ExternalLink, 
  Medal, 
  Code2, 
  Sparkles
} from "lucide-react";
import { Avatar } from "@heroui/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Leaderboard() {
  const { leaderboard, getLeaderboard, isLeaderboardLoading } = useProblemStore();
  const { authUser: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch top 50 users for a detailed leaderboard
    getLeaderboard(50);
  }, [getLeaderboard]);

  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort((a, b) => a.rank - b.rank);
  }, [leaderboard]);

  // Extract top 3 for the podium
  const topThree = useMemo(() => {
    const first = sortedLeaderboard.find(u => u.rank === 1);
    const second = sortedLeaderboard.find(u => u.rank === 2);
    const third = sortedLeaderboard.find(u => u.rank === 3);
    return { first, second, third };
  }, [sortedLeaderboard]);

  // Rest of the list
  const listUsers = useMemo(() => {
    return sortedLeaderboard.filter(u => u.rank > 3);
  }, [sortedLeaderboard]);

  // Filtered lists based on search
  const filteredListUsers = useMemo(() => {
    if (!searchQuery.trim()) return listUsers;
    const query = searchQuery.toLowerCase();
    return listUsers.filter(
      item =>
        item.user.name?.toLowerCase().includes(query) ||
        item.user.username?.toLowerCase().includes(query)
    );
  }, [listUsers, searchQuery]);

  if (isLeaderboardLoading && leaderboard.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <PageLoderLoti />
      </div>
    );
  }

  // Fallbacks for names
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join("") ?? "U";
  };

  return (
    <div className="relative min-h-screen px-4 py-8 md:px-8 max-w-7xl mx-auto pt-20 overflow-hidden">
      {/* Animated gradient background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-20 -right-40 w-[450px] h-[450px] bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-primary/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse animation-delay-3000"></div>
      </div>

      {/* Header */}
      <div className="text-center mb-10 z-10 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-4 animate-bounce">
          <Sparkles className="size-3.5" />
          Global Rankings
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          CodeArena <span className="text-primary">Leaderboard</span>
        </h1>
        <p className="mt-3 text-muted-foreground text-md max-w-xl mx-auto">
          Compete with developers worldwide. Solve problems, climb ranks, and conquer the Arena.
        </p>
      </div>

      {/* Podium Section (Only render if we have at least one top user) */}
      {sortedLeaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-3xl mx-auto mb-16 relative z-10">
          
          {/* Second Place (Silver) */}
          <div className="order-2 md:order-1 flex flex-col items-center">
            {topThree.second ? (
              <div className="flex flex-col items-center group w-full">
                <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <Trophy className="size-6 text-slate-400 drop-shadow-[0_2px_8px_rgba(148,163,184,0.5)] animate-bounce" />
                  </div>
                  <div className="size-20 rounded-full border-4 border-slate-300/80 p-0.5 bg-background shadow-lg shadow-slate-300/20 group-hover:border-slate-300 group-hover:shadow-slate-300/40">
                    <Avatar className="size-full" color="default" variant="soft">
                      <Avatar.Image src={topThree.second.user.avatarUrl} alt={topThree.second.user.name || "Silver"} />
                      <Avatar.Fallback>{getInitials(topThree.second.user.name || "S")}</Avatar.Fallback>
                    </Avatar>
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-slate-400 text-white flex items-center justify-center text-xs font-bold shadow-md">
                    2
                  </div>
                </div>
                
                <Card className="w-full bg-card/40 backdrop-blur-md border border-slate-300/20 shadow-lg text-center p-4 rounded-2xl h-36 flex flex-col justify-between">
                  <CardContent className="p-0 flex flex-col items-center justify-between h-full">
                    <div>
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {topThree.second.user.name || topThree.second.user.username}
                      </h3>
                      <p className="text-xs text-muted-foreground">@{topThree.second.user.username}</p>
                    </div>
                    <div className="mt-2 bg-slate-400/10 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Code2 className="size-3.5" />
                      {topThree.second.solvedCount} Solved
                    </div>
                    <Link 
                      to={`/profile/${topThree.second.userId}`}
                      className="mt-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-0.5 transition-colors"
                    >
                      View Profile <ExternalLink className="size-2.5" />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-44 w-full border border-dashed rounded-2xl border-muted flex items-center justify-center text-xs text-muted-foreground">
                No competitor
              </div>
            )}
          </div>

          {/* First Place (Gold) */}
          <div className="order-1 md:order-2 flex flex-col items-center relative">
            {topThree.first ? (
              <div className="flex flex-col items-center group w-full -translate-y-4 md:-translate-y-6">
                <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
                    <Crown className="size-8 text-amber-500 fill-amber-500 drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)] animate-pulse" />
                  </div>
                  <div className="size-24 rounded-full border-4 border-amber-500 p-0.5 bg-background shadow-xl shadow-amber-500/20 group-hover:border-amber-400 group-hover:shadow-amber-500/40">
                    <Avatar className="size-full" color="warning" variant="soft">
                      <Avatar.Image src={topThree.first.user.avatarUrl} alt={topThree.first.user.name || "Gold"} />
                      <Avatar.Fallback>{getInitials(topThree.first.user.name || "G")}</Avatar.Fallback>
                    </Avatar>
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    1
                  </div>
                </div>

                <Card className="w-full bg-card/60 backdrop-blur-lg border-2 border-amber-500/30 shadow-xl shadow-amber-500/5 text-center p-5 rounded-2xl h-44 flex flex-col justify-between">
                  <CardContent className="p-0 flex flex-col items-center justify-between h-full">
                    <div>
                      <h3 className="font-extrabold text-md line-clamp-1 group-hover:text-primary transition-colors">
                        {topThree.first.user.name || topThree.first.user.username}
                      </h3>
                      <p className="text-xs text-amber-500 font-semibold flex items-center justify-center gap-0.5">
                        Arena Champion
                      </p>
                    </div>
                    <div className="mt-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm">
                      <Code2 className="size-4" />
                      {topThree.first.solvedCount} Solved
                    </div>
                    <Link 
                      to={`/profile/${topThree.first.userId}`}
                      className="mt-2 text-xs text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-0.5 transition-colors font-semibold"
                    >
                      View Profile <ExternalLink className="size-2.5" />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-52 w-full border border-dashed rounded-2xl border-muted flex items-center justify-center text-xs text-muted-foreground">
                No champion yet
              </div>
            )}
          </div>

          {/* Third Place (Bronze) */}
          <div className="order-3 flex flex-col items-center">
            {topThree.third ? (
              <div className="flex flex-col items-center group w-full">
                <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <Trophy className="size-6 text-amber-700 drop-shadow-[0_2px_8px_rgba(180,83,9,0.5)] animate-bounce" />
                  </div>
                  <div className="size-20 rounded-full border-4 border-amber-700/80 p-0.5 bg-background shadow-lg shadow-amber-700/20 group-hover:border-amber-700 group-hover:shadow-amber-700/40">
                    <Avatar className="size-full" color="default" variant="soft">
                      <Avatar.Image src={topThree.third.user.avatarUrl} alt={topThree.third.user.name || "Bronze"} />
                      <Avatar.Fallback>{getInitials(topThree.third.user.name || "B")}</Avatar.Fallback>
                    </Avatar>
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-bold shadow-md">
                    3
                  </div>
                </div>

                <Card className="w-full bg-card/40 backdrop-blur-md border border-amber-700/20 shadow-lg text-center p-4 rounded-2xl h-36 flex flex-col justify-between">
                  <CardContent className="p-0 flex flex-col items-center justify-between h-full">
                    <div>
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {topThree.third.user.name || topThree.third.user.username}
                      </h3>
                      <p className="text-xs text-muted-foreground">@{topThree.third.user.username}</p>
                    </div>
                    <div className="mt-2 bg-amber-700/10 text-amber-800 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Code2 className="size-3.5" />
                      {topThree.third.solvedCount} Solved
                    </div>
                    <Link 
                      to={`/profile/${topThree.third.userId}`}
                      className="mt-2 text-xs text-amber-700 hover:text-amber-800 dark:hover:text-amber-400 flex items-center gap-0.5 transition-colors"
                    >
                      View Profile <ExternalLink className="size-2.5" />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-44 w-full border border-dashed rounded-2xl border-muted flex items-center justify-center text-xs text-muted-foreground">
                No competitor
              </div>
            )}
          </div>

        </div>
      )}

      {/* Main Leaderboard Table Section */}
      <div className="z-10 relative max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 self-start">
            <Medal className="size-5 text-primary" />
            Arena Standings
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search competitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/50 backdrop-blur-sm border-muted focus-visible:ring-primary rounded-xl"
            />
          </div>
        </div>

        {/* Global Competitor Rows */}
        <div className="flex flex-col gap-3.5">
          {/* Currently Logged-in User Profile Row Highlight (if not in top 3 and matches search) */}
          {currentUser && sortedLeaderboard.find(x => x.userId === currentUser.id) && (
            (() => {
              const myEntry = sortedLeaderboard.find(x => x.userId === currentUser.id)!;
              if (myEntry.rank > 3) {
                return (
                  <div className="rounded-2xl p-[1px] bg-gradient-to-r from-primary via-primary/50 to-primary/10 shadow-md">
                    <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-[15px] bg-primary/10 dark:bg-primary/20 backdrop-blur-md">
                      <div className="flex items-center gap-4">
                        <div className="w-8 text-center text-sm font-black text-primary">
                          #{myEntry.rank}
                        </div>
                        <Avatar className="size-11 border-2 border-primary" color="default" variant="soft">
                          <Avatar.Image src={myEntry.user.avatarUrl} alt={myEntry.user.name || "Me"} />
                          <Avatar.Fallback>{getInitials(myEntry.user.name || "Me")}</Avatar.Fallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-foreground">
                              {myEntry.user.name || myEntry.user.username}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">
                              You
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">@{myEntry.user.username}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-primary flex items-center gap-1 justify-end">
                            <Code2 className="size-4" />
                            {myEntry.solvedCount}
                          </div>
                          <span className="text-[10px] text-muted-foreground">Solved</span>
                        </div>
                        <Link 
                          to={`/profile/${myEntry.userId}`}
                          className="p-2 rounded-lg bg-background/80 hover:bg-background text-primary transition-colors flex items-center justify-center"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()
          )}

          {/* List of other users */}
          {filteredListUsers.length > 0 ? (
            filteredListUsers.map((item) => {
              const isSelf = currentUser && item.userId === currentUser.id;
              return (
                <div 
                  key={item.userId}
                  className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
                    isSelf 
                      ? "bg-primary/5 border-primary/30 shadow-md shadow-primary/5" 
                      : "bg-card/45 backdrop-blur-md border-muted/50 hover:bg-card/70 hover:border-muted hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center text-sm font-bold text-muted-foreground">
                      #{item.rank}
                    </div>
                    <Avatar className="size-10" color="default" variant="soft">
                      <Avatar.Image src={item.user.avatarUrl} alt={item.user.name || "User"} />
                      <Avatar.Fallback>{getInitials(item.user.name || "U")}</Avatar.Fallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm">
                          {item.user.name || item.user.username}
                        </span>
                        {isSelf && (
                          <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-black uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">@{item.user.username}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-bold flex items-center gap-1 justify-end">
                        <Code2 className="size-4 text-muted-foreground" />
                        {item.solvedCount}
                      </div>
                      <span className="text-[10px] text-muted-foreground">Solved</span>
                    </div>
                    <Link 
                      to={`/profile/${item.userId}`}
                      className="p-2 rounded-lg bg-muted/30 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            searchQuery.trim() ? (
              <div className="text-center py-10 text-muted-foreground border border-dashed rounded-2xl">
                No competitors match "{searchQuery}"
              </div>
            ) : (
              listUsers.length === 0 && sortedLeaderboard.length <= 3 ? null : (
                <div className="text-center py-10 text-muted-foreground border border-dashed rounded-2xl">
                  No competitors found
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}
