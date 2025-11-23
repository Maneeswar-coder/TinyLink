import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default async function RedirectPage({ params }) {
  const { code } = params;

  const link = await prisma.link.findUnique({
    where: { code },
  });

  // No link? → Show custom 404
  if (!link) return notFound();

  let finalUrl = link.url.trim();

  // Auto-add https
  if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
    finalUrl = "https://" + finalUrl;
  }

  // Invalid URL? → Show custom 404
  if (!isValidUrl(finalUrl)) return notFound();

  // Update stats
  await prisma.link.update({
    where: { code },
    data: {
      clicks: link.clicks + 1,
      lastClicked: new Date(),
      events: { create: {} },
    },
  });

  // Perform redirect
  redirect(finalUrl);
}
