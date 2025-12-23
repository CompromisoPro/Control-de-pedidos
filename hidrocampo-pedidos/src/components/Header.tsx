'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-hidrocampo-green-dark via-hidrocampo-green to-hidrocampo-green-light shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-white rounded-lg p-2 shadow-md">
              <Image
                src="/hidrocampo.jpg"
                alt="Hidrocampo"
                width={160}
                height={50}
                className="h-8 sm:h-10 w-auto"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className="hidden sm:flex items-center gap-4 text-white/90 text-sm">
            <span>Sistema de Pedidos</span>
            <div className="w-px h-6 bg-white/30"></div>
            <span className="font-medium">
              {new Date().toLocaleDateString('es-CL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
