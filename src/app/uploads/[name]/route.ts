import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Next.js en producción sólo sirve los archivos de /public que existían al hacer
// el build, así que las imágenes que sube el administrador (api/upload) darían
// 404. Esta ruta las sirve desde el disco. Los nombres son UUID: se pueden
// cachear para siempre.
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};
const NAME = /^[0-9a-f-]{36}\.(jpg|png|webp|avif)$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const match = NAME.exec(name);
  if (!match) return new NextResponse("No encontrado", { status: 404 });

  try {
    const file = await readFile(path.join(process.cwd(), "public", "uploads", name));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": TYPES[match[1]],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("No encontrado", { status: 404 });
  }
}
