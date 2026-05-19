"use client";

import { useState, useEffect, useCallback } from "react";

export interface WatchHistoryItem {
  bookId: string;
  platform: string;
  title: string;
  cover: string;
  episodeNumber: number;
  totalEpisodes: number;
  duration: number;
  timestamp: number;
  link: string;
}

const STORAGE_KEY = "dracin_history";

function loadHistory(): WatchHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: WatchHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const addToHistory = useCallback((item: WatchHistoryItem) => {
    const items = loadHistory();
    const existing = items.findIndex(
      (h) => h.bookId === item.bookId && h.platform === item.platform
    );
    if (existing !== -1) {
      items[existing] = { ...items[existing], ...item, timestamp: Date.now() };
    } else {
      items.unshift({ ...item, timestamp: Date.now() });
    }
    const trimmed = items.slice(0, 50);
    saveHistory(trimmed);
    setHistory(trimmed);
  }, []);

  const removeFromHistory = useCallback((bookId: string, platform: string) => {
    const items = loadHistory().filter(
      (h) => !(h.bookId === bookId && h.platform === platform)
    );
    saveHistory(items);
    setHistory(items);
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
