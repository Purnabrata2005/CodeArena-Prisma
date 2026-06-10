import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePlaylistStore } from "@/store/usePlaylistStore";
import type { PlaylistWithProblems } from "@/lib/schemas/playlistSchema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FolderHeart, 
  PlaySquare, 
  Trash2, 
  Calendar, 
  ChevronRight,
  Loader2
} from "lucide-react";
import CreatePlaylistDialog from "@/components/playList/CreatePlaylistDialogPage";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { formatDate } from "date-fns";
import { capitalizeWord } from "@/lib/utils";

// Skeleton Loader for Playlists
const PlaylistSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="animate-pulse border border-muted-foreground/10 bg-muted/20">
        <CardHeader className="space-y-2">
          <div className="h-6 w-2/3 bg-muted rounded" />
          <div className="h-4 w-1/3 bg-muted/80 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="flex justify-between items-center pt-4 border-t border-muted-foreground/10">
            <div className="h-5 w-16 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Empty State for Playlists
const PlaylistEmptyState = () => (
  <Card className="border border-dashed border-muted-foreground/30 bg-muted/10 p-8 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto rounded-3xl shadow-sm">
    <div className="p-4 bg-muted/20 rounded-full text-muted-foreground">
      <FolderHeart className="h-10 w-10" />
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold tracking-tight">No playlists yet</h3>
      <p className="text-sm text-muted-foreground">
        Create playlists to group and organize your favorite coding problems.
      </p>
    </div>
    <CreatePlaylistDialog />
  </Card>
);

export default function ProfilePlaylists() {
  const { playlists, getAllPlaylists, deletePlaylist, isLoading } = usePlaylistStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getAllPlaylists();
  }, [getAllPlaylists]);

  const handleDelete = async (playlistId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this playlist?")) {
      setDeletingId(playlistId);
      try {
        await deletePlaylist(playlistId);
      } catch (error) {
        console.error("Error deleting playlist:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Validate data structure and ensure problems is always an array of the correct format
  const validPlaylists = playlists
    .filter((playlist): playlist is PlaylistWithProblems => {
      return (
        playlist &&
        typeof playlist.id === "string" &&
        typeof playlist.name === "string" &&
        (playlist.description === undefined || typeof playlist.description === "string" || playlist.description === null)
      );
    })
    .map((playlist) => ({
      ...playlist,
      problems: Array.isArray(playlist.problems) ? playlist.problems : [],
    }));

  return (
    <section className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">My Playlists</h2>
          <p className="text-sm text-muted-foreground">
            Manage your personal collections of coding tasks
          </p>
        </div>
        {validPlaylists.length > 0 && <CreatePlaylistDialog />}
      </div>

      {isLoading && validPlaylists.length === 0 ? (
        <PlaylistSkeleton />
      ) : validPlaylists.length === 0 ? (
        <PlaylistEmptyState />
      ) : (
        <AnimatedGroup preset="fade" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validPlaylists.map((playlist) => {
            const problemCount = playlist.problems?.length || 0;
            const dateStr = playlist.createdAt 
              ? formatDate(new Date(playlist.createdAt), "yyyy-MM-dd") 
              : "N/A";

            return (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="block group">
                <Card className="h-full border border-border bg-card hover:bg-muted/30 transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md hover:border-muted-foreground/20 relative">
                  {/* Subtle top indicator strip */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="space-y-1 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {capitalizeWord(playlist.name)}
                      </CardTitle>
                      <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                        <PlaySquare className="h-3 w-3" />
                        <span>{problemCount} {problemCount === 1 ? "problem" : "problems"}</span>
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Created {dateStr}</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0 flex-grow flex flex-col justify-between space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                      {playlist.description || "No description provided."}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                      <span className="text-xs font-semibold text-primary flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        View Playlist
                        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                        onClick={(e) => handleDelete(playlist.id, e)}
                        disabled={deletingId === playlist.id}
                      >
                        {deletingId === playlist.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="h-4.5 w-4.5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </AnimatedGroup>
      )}
    </section>
  );
}
