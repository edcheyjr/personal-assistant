import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ message: "Logged out" });

  // Clear the access_token cookie
  response.cookies.set("access_token", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true, // Recommended for security
    secure: process.env.NODE_ENV === "production", // HTTPS in production
    sameSite: "strict", // CSRF protection
  });

  // Clear the user cookie
  response.cookies.set("user", "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true, // Recommended for security
    secure: process.env.NODE_ENV === "production", // HTTPS in production
    sameSite: "strict", // CSRF protection
  });

  return response;
}
