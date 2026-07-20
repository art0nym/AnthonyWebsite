import AdminDashboard from './AdminDashboard';
import { getConventionTableImages, getGalleryImages, getSchedule } from '@/lib/site-content';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [initialSchedule, initialGalleryImages, initialConventionImages] = await Promise.all([
    getSchedule(),
    getGalleryImages(),
    getConventionTableImages(),
  ]);

  return (
    <AdminDashboard
      initialSchedule={initialSchedule}
      initialGalleryImages={initialGalleryImages}
      initialConventionImages={initialConventionImages}
    />
  );
}