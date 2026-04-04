import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  return NextResponse.json({ session });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const body = await request.json();

  // Allow updating slotPhotoMap, copy, or photoPaths
  if (body.slotPhotoMap !== undefined) {
    setSession(params.id, { ...session, slotPhotoMap: body.slotPhotoMap });
  }
  if (body.copy !== undefined) {
    setSession(params.id, { ...session, copy: body.copy });
  }
  if (body.photoPaths !== undefined) {
    setSession(params.id, { ...session, photoPaths: body.photoPaths });
  }

  return NextResponse.json({ ok: true });
}
