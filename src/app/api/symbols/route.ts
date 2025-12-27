import { NextResponse } from "next/server";
import { verifyApiKey, getSession } from "@/server/auth/guard.server";
import { headers } from "next/headers";
import { getAvailableSymbols } from "@/server/data/symbols";

export async function GET(req: Request) {

  try {

    const headerList = await headers();
    const apiKey = headerList.get("x-api-key");
    
    // verification de l'identité du demandeur
    if (apiKey) {
        const isValid = await verifyApiKey();
        if (!isValid) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }
    } else {
        const session = await getSession();
        if (!session) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    const result = await getAvailableSymbols();

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } 
  catch (error: any) {
    console.error("Error fetching symbols:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
