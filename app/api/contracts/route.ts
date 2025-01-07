import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), "contract_analyses.json");
    const fileContents = await fs.readFile(jsonPath, "utf8");
    const contracts = JSON.parse(fileContents);

    return NextResponse.json(contracts);
  } catch (error) {
    console.error("Error reading contracts:", error);
    return NextResponse.json(
      { error: "Failed to load contracts" },
      { status: 500 }
    );
  }
}
