import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return Response.json({ error: "Invalid email" }, { status: 400 });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return Response.json({ error: "Invalid password" }, { status: 400 });

    const token = signToken({ id: user.id, email: user.email });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=604800`,
      },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
