import HomeClient from './components/HomeClient';
import { getConventionTableImages, getGalleryImages, getSchedule } from '@/lib/site-content';

export default async function Home() {
  const [galleryImages, conventionTableImages, schedule] = await Promise.all([
    getGalleryImages(),
    getConventionTableImages(),
    getSchedule(),
  ]);

  return (
    <HomeClient
      galleryImages={galleryImages}
      conventionTableImages={conventionTableImages}
      schedule={schedule}
    />
  );
}
