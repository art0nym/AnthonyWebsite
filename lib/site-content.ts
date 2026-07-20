import { promises as fs } from 'fs';
import path from 'path';
import imageManifest from '@/data/image-manifest.json';

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

const schedulePath = path.join(process.cwd(), 'data/schedule.json');

export async function getGalleryImages(): Promise<SiteImage[]> {
  return imageManifest.gallery as SiteImage[];
}

export async function getConventionTableImages(): Promise<SiteImage[]> {
  return imageManifest.convention as SiteImage[];
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