import React from 'react';

export default function LoadingSpinner({ message = 'Loading details...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
        <div className="absolute inset-0 m-auto h-6 w-6 rounded-full border-2 border-dashed border-emerald-400 animate-pulse"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">{message}</p>
    </div>
  );
}
