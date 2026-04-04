import { NextRequest, NextResponse } from "next/server";
import { mkdir, rm } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { nanoid } from "nanoid";
import { getSession, setSession } from "@/lib/store";
import { SessionData } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ONE_HOUR = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = (formData.get("sessionId") as string | null) ?? nanoid();
    const files = formData.getAll("photos") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 photos allowed" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", sessionId);
    await mkdir(uploadDir, { recursive: true });

    const filePaths: string[] = [];

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only JPEG and PNG allowed.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Max 10MB per file.` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `photo_${Date.now()}_${nanoid(6)}.jpg`;
      const filePath = path.join(uploadDir, filename);

      // Resize to 1500x1500 cover crop
      await sharp(buffer)
        .resize(1500, 1500, { fit: "cover", position: "center" })
        .jpeg({ quality: 90 })
        .toFile(filePath);

      filePaths.push(`/uploads/${sessionId}/${filename}`);
    }

    // Schedule cleanup after 1 hour
    setTimeout(async () => {
      try {
        await rm(uploadDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }, ONE_HOUR);

    // Create the session immediately so subsequent PATCH/analyze calls find it
    const existing = getSession(sessionId);
    if (!existing) {
      setSession(sessionId, {
        productName: "",
        category: "Other",
        language: "en",
        templateMode: "amazon",
        insights: { drivers: [], blockers: [], voiceOfCustomer: [] },
        copy: {} as SessionData["copy"],
        photoPaths: filePaths,
        slotPhotoMap: {},
        createdAt: Date.now(),
      });
    } else {
      setSession(sessionId, { ...existing, photoPaths: filePaths });
    }

    return NextResponse.json({ sessionId, filePaths });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
