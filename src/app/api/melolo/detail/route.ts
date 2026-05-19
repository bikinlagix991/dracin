import { type NextRequest, NextResponse } from "next/server";

const MELOLO_API = "https://melolo-api-azure.vercel.app/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bookId = searchParams.get("bookId");

  if (!bookId) {
    return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
  }

  try {
    const response = await fetch(`${MELOLO_API}/melolo/detail/${encodeURIComponent(bookId)}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
