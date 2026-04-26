import { NextRequest, NextResponse } from "next/server";
import { loadProject, deleteProject } from "@/lib/projectStore";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = loadProject(params.id);
  if (!session) {
    return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, session });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    deleteProject(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Verwijderen mislukt" }, { status: 500 });
  }
}
