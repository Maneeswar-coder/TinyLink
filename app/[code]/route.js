import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { code } = params;

    // 1. Find link
    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // 2. Update click count & last clicked time
    await prisma.link.update({
      where: { code },
      data: {
        clicks: link.clicks + 1,
        lastClicked: new Date(),
      },
    });

    // 3. Redirect user
    return NextResponse.redirect(link.url);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}