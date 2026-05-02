import type React from "react";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlaylistStore } from "@/store/usePlaylistStore";
import LoadingButton from "@/components/landing/LoadingButton";
import { capitalizeWord } from "@/lib/utils";

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string;
}

const AddToPlaylistModal = ({
  isOpen,
  onClose,
  problemId,
}: AddToPlaylistModalProps) => {
  const { playlists, getAllPlaylists, addProblemToPlaylist, isLoading } =
    usePlaylistStore();
  const [selectedPlaylist, setSelectedPlaylist] = useState("");

  useEffect(() => {
    if (isOpen) {
      getAllPlaylists();
    }
  }, [isOpen, getAllPlaylists, problemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(selectedPlaylist);
    console.log(problemId);
    if (!selectedPlaylist) return;
    await addProblemToPlaylist(selectedPlaylist, [problemId]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Add to Playlist
          </DialogTitle>
          <DialogDescription>
            Select a playlist to add this problem to your collection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-3">
            <label
              htmlFor="playlist"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Playlist
            </label>
            <Select
              value={selectedPlaylist}
              onValueChange={setSelectedPlaylist}
              disabled={isLoading || playlists.length === 0}
            >
              <SelectTrigger
                id="playlist"
                className="w-full transition-colors focus:ring-2 focus:ring-primary/20"
              >
                <SelectValue
                  placeholder={
                    isLoading
                      ? "Loading playlists..."
                      : playlists.length === 0
                      ? "No playlists available"
                      : "Select a playlist..."
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-hidden">
                {playlists.map((playlist) => (
                  <SelectItem
                    key={playlist.id}
                    value={playlist.id}
                    className="cursor-pointer"
                  >
                    {capitalizeWord(playlist.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Helpful empty state message */}
            {playlists.length === 0 && !isLoading && (
              <p className="text-[0.8rem] text-muted-foreground">
                You don't have any playlists to add this to yet.
              </p>
            )}
          </div>

          <DialogFooter className="sm:justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <LoadingButton
              isLoading={isLoading}
              type="submit"
              isDisabled={!selectedPlaylist || isLoading}
              className="w-full sm:w-auto"
              startContent={<Plus className="h-4 w-4" />}
            >
              Add to Playlist
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylistModal;
