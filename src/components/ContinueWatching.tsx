"use client";

import { useWatchHistory, type WatchHistoryItem } from "@/hooks/useWatchHistory";
import { useState, useEffect } from "react";
import { Play, Clock, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { optimizeThumb } from "@/lib/image-utils";

export function ContinueWatching() {
  const { history, removeFromHistory, clearHistory } = useWatchHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || history.length === 0) return null;

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Lanjutkan Menonton</h2>
        </div>
        <button
          onClick={clearHistory}
          className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Hapus Semua
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {history.map((item) => (
          <HistoryCard
            key={`${item.platform}-${item.bookId}`}
            item={item}
            onRemove={removeFromHistory}
          />
        ))}
      </div>
    </div>
  );
}

function HistoryCard({
  item,
  onRemove,
}: {
  item: WatchHistoryItem;
  onRemove: (bookId: string, platform: string) => void;
}) {
  return (
    <Link
      href={item.link}
      className="relative group flex-shrink-0 w-36 md:w-44"
    >
      <div className="aspect-[2/3] rounded-xl overflow-hidden">
        <img
          src={optimizeThumb(item.cover)}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* Progress bar */}
        {item.totalEpisodes > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-primary"
              style={{
                width: `${Math.round((item.episodeNumber / item.totalEpisodes) * 100)}%`,
              }}
            />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-10 h-10 text-white fill-white" />
        </div>
      </div>
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(item.bookId, item.platform);
        }}
        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="w-3 h-3" />
      </button>
      {/* Title */}
      <div className="mt-2">
        <p className="text-xs font-medium text-foreground line-clamp-1">{item.title}</p>
        <p className="text-[10px] text-muted-foreground">
          Ep {item.episodeNumber}/{item.totalEpisodes} &middot; {formatTime(item.timestamp)}
        </p>
      </div>
    </Link>
  );
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j yang lalu`;
  return `${Math.floor(hours / 24)}h yang lalu`;
}
