import React from 'react';

export default function Card({ children }: React.PropsWithChildren) {
  return (
    <div className="shadow-xs m-2 flex items-center rounded-lg border border-gray-200 p-3">
      {children}
    </div>
  );
}
