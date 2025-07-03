import { getStoreStatus } from "@/helpers/store-status";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const status = await getStoreStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching store status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
