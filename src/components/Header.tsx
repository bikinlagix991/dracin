"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Play, LogOut, Shield, ShieldOff } from "lucide-react";
import { useSearchDramas } from "@/hooks/useDramas";
import { useReelShortSearch } from "@/hooks/useReelShort";
import { useNetShortSearch } from "@/hooks/useNetShort";
import { useShortMaxSearch } from "@/hooks/useShortMax";
import { useMeloloSearch } from "@/hooks/useMelolo";
import { useFreeReelsSearch } from "@/hooks/useFreeReels";
import { useDramaNovaSearch } from "@/hooks/useDramaNova";
import { useGoodShortSearch } from "@/hooks/useGoodShort";
import { usePineDramaSearch } from "@/hooks/usePineDrama";
import { usePlatform } from "@/hooks/usePlatform";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { usePathname } from "next/navigation";
import { optimizeThumb } from "@/lib/image-utils";

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const normalizedQuery = debouncedQuery.trim();

  // Platform context
  const { platformInfo } = usePlatform();
  const { isLoggedIn, logout, loginRequired, toggleLoginRequired } = useAuth();

  const normalizedQuery = debouncedQuery.trim();
  const activeQuery = normalizedQuery || "";

  const { data: dramaBoxResults, isLoading: isSearchingDramaBox } = useSearchDramas(activeQuery);
  const { data: reelShortResults, isLoading: isSearchingReelShort } = useReelShortSearch(activeQuery);
  const { data: netShortResults, isLoading: isSearchingNetShort } = useNetShortSearch(activeQuery);
  const { data: shortMaxResults, isLoading: isSearchingShortMax } = useShortMaxSearch(activeQuery);
  const { data: meloloResults, isLoading: isSearchingMelolo } = useMeloloSearch(activeQuery);
  const { data: freeReelsResults, isLoading: isSearchingFreeReels } = useFreeReelsSearch(activeQuery);
  const { data: dramaNovaResults, isLoading: isSearchingDramaNova } = useDramaNovaSearch(activeQuery);
  const { data: goodShortResults, isLoading: isSearchingGoodShort } = useGoodShortSearch(activeQuery);
  const { data: pineDramaResults, isLoading: isSearchingPineDrama } = usePineDramaSearch(activeQuery);

  const isSearching = isSearchingDramaBox || isSearchingReelShort || isSearchingNetShort ||
    isSearchingShortMax || isSearchingMelolo || isSearchingFreeReels ||
    isSearchingDramaNova || isSearchingGoodShort || isSearchingPineDrama;

  // Combine all results with platform labels
  const allSearchResults = useMemo(() => {
    const items: Array<{ platform: string; platformId: string; data: any }> = [];
    if (dramaBoxResults?.length) dramaBoxResults.forEach((d: any) => items.push({ platform: "DramaBox", platformId: "dramabox", data: d }));
    if (reelShortResults?.data?.length) reelShortResults.data.forEach((d: any) => items.push({ platform: "ReelShort", platformId: "reelshort", data: d }));
    if (netShortResults?.data?.length) netShortResults.data.forEach((d: any) => items.push({ platform: "NetShort", platformId: "netshort", data: d }));
    if (shortMaxResults?.data?.length) shortMaxResults.data.forEach((d: any) => items.push({ platform: "ShortMax", platformId: "shortmax", data: d }));
    const meloloItems = meloloResults?.data?.search_data?.flatMap((item: any) => item.books || []).filter((b: any) => b.thumb_url) || [];
    if (meloloItems.length) meloloItems.forEach((d: any) => items.push({ platform: "Melolo", platformId: "melolo", data: d }));
    if (freeReelsResults?.length) freeReelsResults.forEach((d: any) => items.push({ platform: "FreeReels", platformId: "freereels", data: d }));
    if (dramaNovaResults?.length) dramaNovaResults.forEach((d: any) => items.push({ platform: "DramaNova", platformId: "dramanova", data: d }));
    if (goodShortResults?.length) goodShortResults.forEach((d: any) => items.push({ platform: "GoodShort", platformId: "goodshort", data: d }));
    if (pineDramaResults?.length) pineDramaResults.forEach((d: any) => items.push({ platform: "PineDrama", platformId: "pinedrama", data: d }));
    return items;
  }, [dramaBoxResults, reelShortResults, netShortResults, shortMaxResults, meloloResults, freeReelsResults, dramaNovaResults, goodShortResults, pineDramaResults]);

  // Helper to get detail link per platform
  const getDetailLink = (platformId: string, item: any) => {
    switch (platformId) {
      case "dramabox": return `/detail/dramabox/${item.bookId}`;
      case "reelshort": return `/detail/reelshort/${item.book_id}`;
      case "netshort": return `/detail/netshort/${item.shortPlayId}`;
      case "shortmax": return `/detail/shortmax/${item.shortPlayId}`;
      case "melolo": return `/detail/melolo/${item.book_id}`;
      case "freereels": return `/detail/freereels/${item.key || item.id}`;
      case "dramanova": return `/detail/dramanova/${item.dramaId}`;
      case "goodshort": return `/detail/goodshort/${item.bookId}`;
      case "pinedrama": return `/detail/pinedrama/${item.collection_id}`;
      default: return "/";
    }
  };

  // Helper to get title per platform
  const getTitle = (platformId: string, item: any) => {
    switch (platformId) {
      case "dramabox": return item.bookName;
      case "reelshort": return item.book_title;
      case "netshort": return item.title;
      case "shortmax": return item.title;
      case "melolo": return item.book_name;
      case "freereels": return item.title;
      case "dramanova": return item.title;
      case "goodshort": return item.bookName;
      case "pinedrama": return item.title;
      default: return "";
    }
  };

  // Helper to get cover per platform
  const getCover = (platformId: string, item: any) => {
    switch (platformId) {
      case "dramabox": return item.cover;
      case "reelshort": return item.book_pic;
      case "netshort": return item.cover;
      case "shortmax": return item.cover;
      case "melolo": return item.thumb_url;
      case "freereels": return item.cover;
      case "dramanova": return item.posterImgUrl;
      case "goodshort": return item.cover;
      case "pinedrama": return item.cover;
      default: return "";
    }
  };

  // Helper to get unique key per platform
  const getLinkKey = (platformId: string, item: any) => {
    switch (platformId) {
      case "dramabox": return item.bookId;
      case "reelshort": return item.book_id;
      case "netshort": return item.shortPlayId;
      case "shortmax": return item.shortPlayId;
      case "melolo": return item.book_id;
      case "freereels": return item.key || item.id;
      case "dramanova": return item.dramaId;
      case "goodshort": return item.bookId;
      case "pinedrama": return item.collection_id;
      default: return "";
    }
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  // Hide header on watch pages for immersive video experience
  if (pathname?.startsWith("/watch")) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">
              SekaiDrama
            </span>
          </Link>

          {/* Search Button + Admin Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {isLoggedIn && (
              <>
                <button
                  onClick={toggleLoginRequired}
                  className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                  aria-label={loginRequired ? "Disable login" : "Enable login"}
                  title={loginRequired ? "Login wajib: ON" : "Login wajib: OFF"}
                >
                  {loginRequired ? (
                    <Shield className="w-5 h-5 text-green-400" />
                  ) : (
                    <ShieldOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Overlay (Portal) */}
      {searchOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-background z-[9999] overflow-hidden">
            <div className="container mx-auto px-4 py-6 h-[100dvh] flex flex-col">
              <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari drama di semua platform..."
                    className="search-input pl-12"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSearchClose}
                  className="p-3 rounded-xl hover:bg-muted/50 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Platform indicator */}
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Mencari di semua platform:</span>
                <span className="px-2 py-1 rounded-full bg-primary/20 text-primary font-medium text-xs">
                  {allSearchResults.length} hasil
                </span>
              </div>

              {/* Search Results */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                {isSearching && normalizedQuery && (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {allSearchResults.length > 0 && (
                  <div className="grid gap-3">
                    {allSearchResults.map((item, index) => (
                      <Link
                        key={`${item.platformId}-${getLinkKey(item.platformId, item.data)}-${index}`}
                        href={getDetailLink(item.platformId, item.data)}
                        onClick={handleSearchClose}
                        className="flex gap-4 p-4 rounded-2xl bg-card hover:bg-muted transition-all text-left animate-fade-up overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <img
                          src={optimizeThumb(getCover(item.platformId, item.data))}
                          alt={getTitle(item.platformId, item.data)}
                          className="w-16 h-24 object-cover rounded-xl flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                              {item.platform}
                            </span>
                          </div>
                          <h3 className="font-display font-semibold text-foreground truncate">
                            {getTitle(item.platformId, item.data)}
                          </h3>
                          {item.data.introduction && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {item.data.introduction || item.data.description || item.data.abstract || item.data.special_desc || item.data.desc}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {allSearchResults.length === 0 && normalizedQuery && !isSearching && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Tidak ada hasil untuk "{normalizedQuery}"</p>
                  </div>
                )}

                {!normalizedQuery && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Ketik untuk mencari drama di semua platform</p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
