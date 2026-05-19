import { safeJson } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MELOLO_API = "https://melolo-api-azure.vercel.app/api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const offset = searchParams.get("offset") || "0";
    
    const response = await fetch(`${MELOLO_API}/melolo/latest`, {
      cache: 'no-store',
    });

    if (!response.ok) {
        return NextResponse.json({ 
            books: [], 
            has_more: false, 
            next_offset: 0 
        });
    }

    const json = await safeJson<any>(response);
    const data = json.data || json;

    let books: any[] = [];
    
    if (data?.cell?.cell_data && Array.isArray(data.cell.cell_data)) {
        data.cell.cell_data.forEach((section: any) => {
            if (section.books && Array.isArray(section.books)) {
                books = [...books, ...section.books];
            }
        });
    }

    if (data?.cell?.books && Array.isArray(data.cell.books)) {
        books = [...books, ...data.cell.books];
    }

    if (data?.books && Array.isArray(data.books)) {
        books = [...books, ...data.books];
    }
    
    const hasMore = data?.has_more ?? data?.cell?.has_more ?? false;
    const nextOffset = data?.next_offset ?? data?.cell?.next_offset ?? 0;

    return NextResponse.json({
      books: books,
      has_more: hasMore,
      next_offset: nextOffset,
    });
  } catch (error) {
    console.error("Melolo ForYou Error:", error);
    return NextResponse.json({ 
        books: [], 
        has_more: false, 
        next_offset: 0 
    });
  }
}
