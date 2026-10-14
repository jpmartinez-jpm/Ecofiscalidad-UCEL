import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark */}
          <a
            href="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-emerald-800 transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Observatorio Ecofiscal · UCEL</span>
          </a>

          {/* Zone 2: Concise navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#mapa-ecofiscal"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Mapa Ecofiscal
            </a>
            <a
              href="#buscador-ecofiscalidad"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Doctrina y novedades
            </a>
            <a
              href="#buscador"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Catálogo
            </a>
            <a
              href="#metodologia"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Metodología
            </a>
            <a
              href="#contacto"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Contacto
            </a>
          </nav>

          {/* Zone 3: Actions */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <a
              href="https://github.com/jpmartinez-jpm/Ecofiscalidad-UCEL"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              GitHub ↗
            </a>
            <a
              href="#mapa-ecofiscal"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Explorar Mapa
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <a
            href="#mapa-ecofiscal"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-emerald-800"
          >
            Mapa Cartográfico Ecofiscal
          </a>
          <a
            href="#buscador-ecofiscalidad"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-emerald-800"
          >
            Doctrina y novedades UCEL
          </a>
          <a
            href="#buscador"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-emerald-800"
          >
            Catálogo & Filtros
          </a>
          <a
            href="#metodologia"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-emerald-800"
          >
            Metodología
          </a>
          <a
            href="#contacto"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-emerald-800"
          >
            Contacto
          </a>
          <div className="pt-2">
            <a
              href="#buscador"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              Explorar Catálogo
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
