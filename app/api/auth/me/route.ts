import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieStore = req.cookies;
  let user = null;
  let apiToken = null;

  try {
    const userCookie = cookieStore.get("user");
    user = userCookie ? JSON.parse(userCookie.value) : null;

    const tokenCookie = cookieStore.get("access_token");
    apiToken = tokenCookie ? tokenCookie.value : null;
  } catch (error) {
    console.error("Failed to parse cookie JSON:", error);
  }

  return NextResponse.json({
    user,
    apiToken,
  });
}
