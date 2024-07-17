import { Suspense } from 'react';

export default function Loading({children}: {children: React.ReactNode}) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
      {children}
    </Suspense>
  );
}
