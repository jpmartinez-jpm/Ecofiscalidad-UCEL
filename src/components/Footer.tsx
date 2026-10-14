import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 md:py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-3">
            <a href="/" className="text-xl font-bold tracking-tight text-white hover:text-emerald-400 transition-colors flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Observatorio de Ecofiscalidad · UCEL</span>
            </a>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Proyecto de investigación de la UCEL (Rosario) sobre los instrumentos del Derecho Financiero con fines ambientales:
              relevamiento normativo de la Nación, las provincias y los municipios, con novedades y doctrina.
            </p>
            <div className="text-[11px] text-slate-400 font-mono pt-1 flex items-center gap-2">
              <span>Repositorio GitHub:</span>
              <a
                href="https://github.com/jpmartinez-jpm/Ecofiscalidad-UCEL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                jpmartinez-jpm/Ecofiscalidad-UCEL
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Navegación
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#buscador-ecofiscalidad" className="hover:text-white transition-colors">
                  Buscador Ecofiscalidad • UCEL
                </a>
              </li>
              <li>
                <a href="#mapa-ecofiscal" className="hover:text-white transition-colors">
                  Mapa Cartográfico Ecofiscal
                </a>
              </li>
              <li>
                <a href="#buscador" className="hover:text-white transition-colors">
                  Catálogo de Normas por Tributo
                </a>
              </li>
              <li>
                <a href="#metodologia" className="hover:text-white transition-colors">
                  Metodología
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-white transition-colors">
                  Mesa de Consultas Técnicas
                </a>
              </li>
            </ul>
          </div>

          {/* Institutional Channels */}
          <div className="md:col-span-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Participación & Contacto
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Para aportar una norma, corregir una ficha o hacer una consulta, escribí a la Secretaría de Investigación:
            </p>
            <div className="text-xs text-emerald-400 font-mono">
              seciyp@ucel.edu.ar
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Universidad del Centro Educativo Latinoamericano (UCEL) · Proyecto “Instrumentos ecofiscales”.
          </div>
          <div className="flex items-center gap-4">
            <a href="#buscador" className="hover:text-slate-300 transition-colors">
              Descargar datos (CSV/JSON)
            </a>
            <span>·</span>
            <a href="#contacto" className="hover:text-slate-300 transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
