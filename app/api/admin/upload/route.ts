import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import sizeOf from 'image-size';
import { ADMIN_SESSION_COOKIE, isAuthenticatedAdmin } from '@/lib/admin-auth';

const allowedTargets = new Set(['gallery', 'convention']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

function sanitizeBaseName(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function toPublicSrc(target: string, fileName: string) {
  return target === 'gallery'
    ? `/images/galleryImages/${fileName}`
    : `/images/conventionTables/${fileName}`;
}

export async function POST(request: NextRequest) {
  const isAuthed = isAuthenticatedAdmin(request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? null);
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const target = formData.get('target');
  const file = formData.get('file');

  if (typeof target !== 'string' || !allowedTargets.has(target)) {
    return NextResponse.json({ error: 'Invalid upload target' }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file upload' }, { status: 400 });
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  const outputDir = target === 'gallery'
    ? path.join(process.cwd(), 'public/images/galleryImages')
    : path.join(process.cwd(), 'public/images/conventionTables');

  await fs.mkdir(outputDir, { recursive: true });

  const existingFiles = await fs.readdir(outputDir);
  const maxPrefix = existingFiles.reduce((maxValue, existingFile) => {
    const prefix = parseInt(existingFile.match(/^\d+/)?.[0] ?? '0', 10);
    return Math.max(maxValue, prefix);
  }, 0);

  const baseName = sanitizeBaseName(file.name) || 'Upload';
  const nextPrefix = target === 'gallery' ? maxPrefix + 1 : 0;
  const finalName = target === 'gallery'
    ? `${nextPrefix} ${baseName}${extension}`
    : `${baseName}${extension}`;
  const outputPath = path.join(outputDir, finalName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(outputPath, buffer);

  const dimensions = sizeOf(buffer);

  return NextResponse.json({
    ok: true,
    image: {
      src: toPublicSrc(target, finalName),
      alt: baseName,
      width: dimensions.width ?? 800,
      height: dimensions.height ?? 1000,
      isLandscape: (dimensions.width ?? 0) > (dimensions.height ?? 0),
    },
  });
}