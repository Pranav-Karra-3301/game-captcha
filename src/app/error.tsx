'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="max-w-md w-full bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-xl">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h1>
        
        <p className="mb-4">
          The page encountered an unexpected error.
        </p>
        
        <div className="bg-gray-950 p-3 rounded text-sm mb-6 overflow-auto max-h-32">
          <code>{error.message || 'Unknown error'}</code>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
          >
            Try Again
          </button>
          
          <Link href="/"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded text-white text-center transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
} 