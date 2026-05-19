import { useEffect, useRef } from "react";
import { useWatchHistory } from "@/hooks/useWatchHistory";

interface SaveHistoryParams {
  bookId: string;
  platform: string;
  title: string;
  cover: string;
  episodeNumber: number;
  totalEpisodes: number;
  link: string;
  enabled: boolean;
}

export function useSaveWatchHistory(params: SaveHistoryParams) {
  const { addToHistory } = useWatchHistory();
  const savedRef = useRef(false);

  useEffect(() => {
    if (!params.enabled || !params.bookId || savedRef.current) return;
    savedRef.current = true;

    addToHistory({
      bookId: params.bookId,
      platform: params.platform,
      title: params.title,
      cover: params.cover,
      episodeNumber: params.episodeNumber,
      totalEpisodes: params.totalEpisodes,
      duration: 0,
      link: params.link,
      timestamp: Date.now(),
    });
  }, [params.enabled, params.bookId, params.episodeNumber]);
}
