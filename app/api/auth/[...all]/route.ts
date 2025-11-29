// app/api/auth/[...all]/route.ts
import { auth } from "@/features/authentification/server/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
