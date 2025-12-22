import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hidrocampo - Sistema de Pedidos',
  description: 'Sistema de gestión de pedidos para Hidrocampo',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
