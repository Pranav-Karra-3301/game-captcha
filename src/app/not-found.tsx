import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="max-w-md w-full bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-500">404</h1>
        <h2 className="text-xl mb-6">Page Not Found</h2>
        
        <p className="mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link href="/"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white inline-block transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 