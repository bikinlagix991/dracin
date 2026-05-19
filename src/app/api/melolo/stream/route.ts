import { type NextRequest } from "next/server";
import { encryptedResponse } from "@/lib/api-utils";

const MELOLO_API = "https://melolo-api-azure.vercel.app/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return Response.json({ error: "Missing videoId" }, { status: 400 });
  }

  try {
    const response = await fetch(`${MELOLO_API}/melolo/stream/${encodeURIComponent(videoId)}`);
    const data = await response.json();
    return encryptedResponse(data);
  } catch (error) {
    console.error("Error fetching Melolo stream:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
