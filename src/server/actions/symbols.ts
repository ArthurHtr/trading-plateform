"use server";

import { getAvailableSymbols } from "@/server/data/symbols";

export async function fetchAvailableSymbolsAction() {
  try {
    const data = await getAvailableSymbols();
    return data;
  } 
  catch (error) {
    console.error("Failed to fetch symbols:", error);
    throw new Error("Failed to fetch symbols");
  }
}
