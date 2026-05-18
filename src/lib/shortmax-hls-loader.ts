import { decryptShortMaxSegment } from "./shortmax-decryptor";

interface LoaderConfig {
  maxRetry: number;
  timeout: number;
  retryDelay: number;
  maxRetryDelay: number;
}

interface LoaderContext {
  url: string;
  type: string;
  frag?: unknown;
  [key: string]: unknown;
}

interface LoaderStats {
  aborted: boolean;
  loaded: number;
  total: number;
  retry: number;
  chunkCount: number;
  bwEstimate: number;
  loading: HlsProgressivePerformanceRecord;
  parsing: HlsProgressivePerformanceRecord;
  buffering: HlsProgressivePerformanceRecord;
}

interface HlsPerformanceRecord {
  start: number;
  end: number;
}

interface HlsProgressivePerformanceRecord {
  execute: boolean;
  start: number;
  end: number;
  [key: string]: unknown;
}

interface LoaderCallbacks {
  onSuccess(
    response: { url: string; data: string | ArrayBuffer },
    stats: LoaderStats,
    context: LoaderContext,
    networkDetails: unknown
  ): void;
  onError(
    error: { code: number; text: string },
    context: LoaderContext,
    networkDetails: unknown
  ): void;
  onTimeout(stats: LoaderStats, context: LoaderContext, networkDetails: unknown): void;
  onProgress?(
    stats: LoaderStats,
    context: LoaderContext,
    data: string | ArrayBuffer,
    networkDetails: unknown
  ): void;
}

function createStats(): LoaderStats {
  return {
    aborted: false,
    loaded: 0,
    total: 0,
    retry: 0,
    chunkCount: 0,
    bwEstimate: 0,
    loading: { start: performance.now(), end: 0, execute: true },
    parsing: { start: 0, end: 0, execute: false },
    buffering: { start: 0, end: 0, execute: false },
  };
}

export class ShortMaxFragmentLoader {
  stats: LoaderStats;
  private xhr: XMLHttpRequest | null = null;

  constructor(_config: LoaderConfig) {
    this.stats = createStats();
  }

  load(context: LoaderContext, config: LoaderConfig, callbacks: LoaderCallbacks): void {
    const stats = createStats();
    stats.loading.start = performance.now();

    const xhr = new XMLHttpRequest();
    this.xhr = xhr;
    xhr.open("GET", context.url, true);
    xhr.responseType = "arraybuffer";
    xhr.timeout = config.timeout || 30000;

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        stats.loading.end = performance.now();
        stats.loaded = xhr.response.byteLength;
        stats.total = xhr.response.byteLength;

        let data: ArrayBuffer = xhr.response;
        if (context.frag) {
          data = decryptShortMaxSegment(data);
          stats.parsing.start = performance.now();
          stats.parsing.end = performance.now();
        }

        callbacks.onSuccess({ url: context.url, data }, stats, context, xhr);
      } else {
        callbacks.onError(
          { code: xhr.status, text: xhr.statusText },
          context,
          xhr
        );
      }
    };

    xhr.onerror = () => {
      callbacks.onError({ code: 0, text: "network error" }, context, xhr);
    };

    xhr.ontimeout = () => {
      callbacks.onTimeout(stats, context, xhr);
    };

    try {
      xhr.send();
    } catch {
      callbacks.onError({ code: 0, text: "send error" }, context, xhr);
    }
  }

  destroy(): void {
    if (this.xhr) {
      this.xhr.abort();
      this.xhr = null;
    }
  }

  abort(): void {
    if (this.xhr) {
      this.xhr.abort();
      this.xhr = null;
    }
  }
}
