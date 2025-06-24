
import React from 'react';

export const FullBleed: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
    {children}
  </div>
);
