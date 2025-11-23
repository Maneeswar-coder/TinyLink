import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    const { code } = params;

    const cookie = req.headers.get("cookie");
    const token = cookie?.split("token=")[1];
    const user = verifyToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if link belongs to user
    const link = await prisma.link.findUnique({ where: { code } });

    if (!link || link.userId !== user.id) {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }

    await prisma.link.delete({
      where: { code },
    });

    return Response.json({ ok: true, message: "Deleted" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
