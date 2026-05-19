import { type NextRequest } from "next/server";
import { encryptedResponse } from "@/lib/api-utils";

const MELOLO_API = "https://melolo-api-azure.vercel.app/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return encryptedResponse({ error: "Query parameter is required" }, 400);
  }

  try {
    const response = await fetch(`${MELOLO_API}/melolo/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    return encryptedResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return encryptedResponse({ error: message }, 500);
  }
}
