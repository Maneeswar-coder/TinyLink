import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  const cookie = req.headers.get("cookie");

  if (!cookie) return Response.json({ user: null });

  const token = cookie.split("token=")[1];
  if (!token) return Response.json({ user: null });

  const data = verifyToken(token);

  return Response.json({ user: data || null });
}
