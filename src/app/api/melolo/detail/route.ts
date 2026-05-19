import { type NextRequest } from "next/server";
import { encryptedResponse } from "@/lib/api-utils";

const MELOLO_API = "https://melolo-api-azure.vercel.app/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bookId = searchParams.get("bookId");

  if (!bookId) {
    return Response.json({ error: "Missing bookId" }, { status: 400 });
  }

  try {
    const response = await fetch(`${MELOLO_API}/melolo/detail/${encodeURIComponent(bookId)}`);
    const data = await response.json();
    return encryptedResponse(data);
  } catch (error) {
    console.error("Error fetching Melolo detail:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
