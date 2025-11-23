import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    const cookie = req.headers.get("cookie");
    const token = cookie?.split("token=")[1];
    const user = verifyToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const links = await prisma.link.findMany({
      where: { userId: user.id },
      orderBy: { id: "desc" },
    });

    return Response.json({ ok: true, links });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
