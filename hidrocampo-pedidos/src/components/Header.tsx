'use client';

import { Leaf } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-hidrocampo-green-dark via-hidrocampo-green to-hidrocampo-green-light shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-2 shadow-md">
              <Leaf className="w-8 h-8 text-hidrocampo-green" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                HIDROCAMPO
              </h1>
              <p className="text-hidrocampo-yellow text-xs sm:text-sm font-medium -mt-1">
                CULTIVANDO SABOR
              </p>
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
