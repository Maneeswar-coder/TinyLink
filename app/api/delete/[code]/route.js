import prisma from "../../../../lib/prisma.js";


export async function DELETE(req, { params }) {
  const { code } = params;

  if (!code) {
    return Response.json({ error: "Code required" }, { status: 400 });
  }

  const deleted = await prisma.link.deleteMany({
    where: { code },
  });

  return Response.json({
    ok: true,
    deletedCount: deleted.count
  });
}
