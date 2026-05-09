import type { Problem } from "@/lib/schemas/problemSchema";
import {
  Home,
  Clock,
  ChevronRight,
  Users,
  ThumbsUp,
  Bookmark,
  Share2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ThemeSelector from "@/components/editor/ThemeSelector";
import LanguageSelector from "@/components/editor/LanguageSelector";

import AddToPlaylistModal from "@/components/playList/AddToPlaylistPage";
import { usePlaylistDialog } from "@/store/usePlaylistDialogStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ProblemHeaderProps {
  problem: Problem;
  submissionCount: number | undefined;
  successRate: number | undefined;
}
export default function ProblemHeader({
  problem,
  submissionCount,
  successRate,
}: ProblemHeaderProps) {
  const { closeDialog, open, openDialog } = usePlaylistDialog();
  const handleShare = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    navigator.clipboard.writeText(`${baseUrl}/problems/${problem.id}`);
    toast.info("Link copied to clipboard 🎉");
  };
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/problems">
                <span className="text-sm">Problems</span>
              </Link>

              <ChevronRight className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{problem.title}</h1>
              <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Updated {problem.createdAt ? new Date(problem.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{formatNumber(submissionCount || 0)} Submissions</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{successRate}% Success Rate</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDialog(problem.id)}
              className="hover:text-primary"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={handleShare} size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <div className="flex w-full items-center gap-2">
              <ThemeSelector />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
      <AddToPlaylistModal
        problemId={problem.id}
        onClose={closeDialog}
        isOpen={open}
      />
    </div>
  );
}
