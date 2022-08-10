import React from 'react';

export default function CardContainer({ children }: React.PropsWithChildren) {
  return (
    <div className="mb-8 grid gap-1 md:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  );
}
