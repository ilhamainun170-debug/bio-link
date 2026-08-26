import React from 'react';
import { db, fetchFromPostgres } from '@/lib/db';
import PublicBioView from '@/components/public/PublicBioView';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await fetchFromPostgres();
  const publicData = db.getPublicView();

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 md:p-8">
      <PublicBioView initialData={publicData} />
    </main>
  );
}
