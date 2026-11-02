import React from 'react';

/** En el celular la app ocupa toda la pantalla. La versión web agrega la presentación de la demo. */
export function DemoShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
