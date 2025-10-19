// lib/cookies-server.ts
"use server";
import { cookies } from "next/headers";

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}

export async function getTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}