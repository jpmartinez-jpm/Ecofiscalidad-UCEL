import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

/** Logo de la UCEL (public/ucel-logo-blanco.png). El archivo trae el azul institucional de fondo: va solo sobre bg-ucel-800. */
const LOGO_UCEL = `${import.meta.env.BASE_URL}ucel-logo-blanco.png`;

const ENLACES: [string, string][] = [
  ['#mapa-ecofiscal', 'Mapa'],
  ['#buscador-ecofiscalidad', 'Doctrina y novedades'],
  ['#buscador', 'Catálogo'],
  ['#metodologia', 'Metodología'],
  ['#contacto', 'Contacto'],
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-ucel-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 min-h-[72px] md:min-h-[110px]">
          {/* Logo de la UCEL y nombre del proyecto */}
          <a href="#" className="flex items-center gap-4 min-w-0 shrink-0">
            <img
              src={LOGO_UCEL}
              alt="UCEL, Universidad del Centro Educativo Latinoamericano"
              width={195}
              height={69}
              className="h-11 md:h-[69px] w-auto shrink-0"
            />
            <span className="hidden sm:flex flex-col border-l border-ucel-200/70 pl-4 leading-tight">
              <span className="text-sm font-medium">Observatorio Ecofiscal</span>
              <span className="text-xs text-ucel-200">Facultad de Ciencias Jurídicas y Sociales</span>
            </span>
          </a>

          {/* Navegación */}
          <nav className="hidden lg:flex items-center gap-6 text-sm" aria-label="Secciones">
            {ENLACES.map(([href, texto]) => (
              <a key={href} href={href} className="py-2 border-b-2 border-transparent hover:border-verde-ucel transition-colors whitespace-nowrap">
                {texto}
              </a>
            ))}
            <a
              href="https://github.com/jpmartinez-jpm/Ecofiscalidad-UCEL"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium border border-ucel-200/70 rounded-md hover:bg-white hover:text-ucel-800 transition-colors whitespace-nowrap"
            >
              GitHub ↗
            </a>
          </nav>

          {/* Botón del menú en celular */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-white hover:bg-ucel-700"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú desplegable en celular */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/15 bg-ucel-900 px-4 pt-2 pb-4">
          {ENLACES.map(([href, texto]) => (
            <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm text-white hover:text-verde-ucel">
              {texto}
            </a>
          ))}
          <a
            href="https://github.com/jpmartinez-jpm/Ecofiscalidad-UCEL"
            target="_blank"
            rel="noopener noreferrer"
            className="block py-2.5 text-sm text-ucel-200 hover:text-white"
          >
            Código y datos en GitHub ↗
          </a>
        </div>
      )}
    </header>
  );
};
