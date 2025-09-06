import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    // Exchange code for tokens via FastAPI
    const tokenRes = await fetch(
      `${process.env.FASTAPI_TOKEN_ENDPOINT}?code=${code}`
    );
    const { access_token, id_token, details } = await tokenRes.json();

    if (!id_token) {
      return NextResponse.json(
        {
          error: "No id_token in response from FastAPI",
          details: details,
        },
        { status: 500 }
      );
    }

    // Decode id_token for user info (profile image, name, email)
    const payload = JSON.parse(
      Buffer.from(id_token.split(".")[1], "base64").toString()
    );
    const userinfo = {
      name: payload.name || payload.email,
      email: payload.email,
      picture: payload.picture || null,
    };

    // Create redirect response
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const origin = `${proto}://${host}`;
    const response = NextResponse.redirect(new URL("/?auth=success", origin));
    // Set access token in HTTP-only cookie
    response.cookies.set("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
      sameSite: "strict",
    });

    // Set user info in regular cookie (accessible to client-side JS)
    response.cookies.set("user", JSON.stringify(userinfo), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
      sameSite: "strict",
    });

    return response;
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err && typeof err === "object" && "message" in err) {
      message = (err as { message: string }).message;
    }
    return NextResponse.json(
      { error: "Token exchange failed", details: message },
      { status: 500 }
    );
  }
}
