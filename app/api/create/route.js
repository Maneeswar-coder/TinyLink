import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function generateCode(len = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let c = "";
  for (let i = 0; i < len; i++) {
    c += chars[Math.floor(Math.random() * chars.length)];
  }
  return c;
}

export async function POST(req) {
  try {
    // ────────────────────────────────
    // 1. AUTH CHECK
    // ────────────────────────────────
    const cookie = req.headers.get("cookie");
    const token = cookie?.split("token=")[1];
    const user = verifyToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ────────────────────────────────
    // 2. VALIDATE INPUT
    // ────────────────────────────────
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    // ────────────────────────────────
    // 3. GENERATE UNIQUE SHORT CODE
    // ────────────────────────────────
    let code = generateCode();
    let exists = await prisma.link.findUnique({ where: { code } });

    while (exists) {
      code = generateCode();
      exists = await prisma.link.findUnique({ where: { code } });
    }

    // ────────────────────────────────
    // 4. SAVE IN DB
    // ────────────────────────────────
    const link = await prisma.link.create({
      data: { url, code, userId: user.id },
    });

    const shortUrl = `${process.env.BASE_URL}/${code}`;

    return Response.json({ ok: true, shortUrl, link });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
