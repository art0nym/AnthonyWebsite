import { promises as fs } from 'fs';
import path from 'path';
import sizeOf from 'image-size';

export interface SiteImage {
  src: string;
  previewSrc?: string;
  alt: string;
  width: number;
  height: number;
  isLandscape?: boolean;
}

export interface ScheduleEvent {
  name: string;
  dates: string;
  url?: string;
}

export interface ScheduleMonth {
  month: string;
  monthNumber: number;
  imageSrc?: string | null;
  events: ScheduleEvent[];
}

const imagePattern = /\.(jpg|jpeg|png|gif|webp|JPG|JPEG|PNG|GIF|WEBP)$/i;
const schedulePath = path.join(process.cwd(), 'data/schedule.json');

async function readImageDimensions(filePath: string) {
  let width = 800;
  let height = 1000;
  let isLandscape = false;

  try {
    const buffer = await fs.readFile(filePath);
    const dimensions = sizeOf(buffer);
    if (dimensions.width && dimensions.height) {
      width = dimensions.width;
      height = dimensions.height;
      isLandscape = dimensions.width > dimensions.height;
    }
  } catch (error) {
    console.error(`Error getting dimensions for ${filePath}:`, error);
  }

  return { width, height, isLandscape };
}

async function readImageFiles(directory: string) {
  try {
    const files = await fs.readdir(directory);
    return files.filter(file => imagePattern.test(file));
  } catch (error) {
    console.error(`Error reading images from ${directory}:`, error);
    return [] as string[];
  }
}

export async function getGalleryImages(): Promise<SiteImage[]> {
  const galleryDir = path.join(process.cwd(), 'public/images/galleryImages');
  const previewDir = path.join(process.cwd(), 'public/images/galleryImagesPreviews');
  const galleryFiles = await readImageFiles(galleryDir);
  const previewFiles = await readImageFiles(previewDir);

  galleryFiles.sort((a, b) => {
    const numA = parseInt(a.match(/^\d+/)?.[0] || '0', 10);
    const numB = parseInt(b.match(/^\d+/)?.[0] || '0', 10);
    return numA - numB;
  });

  const previewMap = new Map<string, string>();
  previewFiles.forEach(file => {
    previewMap.set(file.replace(/\.[^/.]+$/, '').toLowerCase(), file);
  });

  return Promise.all(
    galleryFiles.map(async filename => {
      const filePath = path.join(galleryDir, filename);
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
      const previewFilename = previewMap.get(nameWithoutExt.toLowerCase());
      const previewSrc = previewFilename
        ? `/images/galleryImagesPreviews/${previewFilename}`
        : `/images/galleryImages/${filename}`;

      let dimensions = await readImageDimensions(filePath);
      if (previewFilename) {
        const previewPath = path.join(previewDir, previewFilename);
        dimensions = await readImageDimensions(previewPath);
      }

      return {
        src: `/images/galleryImages/${filename}`,
        previewSrc,
        alt: nameWithoutExt.replace(/^\d+\s+/, '').replace(/[-_]/g, ' '),
        ...dimensions,
      };
    })
  );
}

export async function getConventionTableImages(): Promise<SiteImage[]> {
  const conventionDir = path.join(process.cwd(), 'public/images/conventionTables');
  const conventionFiles = await readImageFiles(conventionDir);

  return Promise.all(
    conventionFiles.map(async filename => {
      const filePath = path.join(conventionDir, filename);
      const dimensions = await readImageDimensions(filePath);

      return {
        src: `/images/conventionTables/${filename}`,
        alt: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        ...dimensions,
      };
    })
  );
}

export async function getSchedule(): Promise<ScheduleMonth[]> {
  try {
    const raw = await fs.readFile(schedulePath, 'utf8');
    const parsed = JSON.parse(raw) as ScheduleMonth[];
    return parsed;
  } catch (error) {
    console.error('Error reading schedule data:', error);
    return [];
  }
}

export async function saveSchedule(schedule: ScheduleMonth[]) {
  await fs.writeFile(schedulePath, `${JSON.stringify(schedule, null, 2)}\n`, 'utf8');
}