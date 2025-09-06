import { cookies } from "next/headers";

export async function auth() {
  const cookieStore = await cookies();

  try {
    const userCookie = cookieStore.get("user");
    const tokenCookie = cookieStore.get("access_token");

    if (!userCookie || !tokenCookie) {
      return null;
    }

    const user = JSON.parse(userCookie.value);

    return {
      user,
      accessToken: tokenCookie.value,
    };
  } catch (error) {
    return null;
  }
}
