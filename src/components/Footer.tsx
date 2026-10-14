import React from 'react';

/** Logo de la UCEL (public/ucel-logo-blanco.png), sobre el azul institucional del pie. */
const LOGO_UCEL = `${import.meta.env.BASE_URL}ucel-logo-blanco.png`;

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ucel-800 text-ucel-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Logo y proyecto */}
          <div className="md:col-span-5 space-y-4">
            <img src={LOGO_UCEL} alt="UCEL, Universidad del Centro Educativo Latinoamericano" width={159} height={56} className="h-14 w-auto" />
            <p className="text-sm leading-relaxed max-w-md">
              Proyecto de investigación “Instrumentos ecofiscales”. Facultad de Ciencias Jurídicas y Sociales, Cátedra de Finanzas Públicas y
              Derecho Tributario. Relevamiento normativo de la Nación, las provincias y los municipios, con novedades y doctrina.
            </p>
            <p className="text-xs">
              Código y datos:{' '}
              <a
                href="https://github.com/jpmartinez-jpm/Ecofiscalidad-UCEL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline underline-offset-4 hover:text-verde-ucel"
              >
                github.com/jpmartinez-jpm/Ecofiscalidad-UCEL
              </a>
            </p>
          </div>

          {/* Secciones */}
          <div className="md:col-span-3">
            <div className="text-sm font-semibold uppercase tracking-wider text-white mb-3">Secciones</div>
            <ul className="space-y-2 text-sm">
              {[
                ['#mapa-ecofiscal', 'Mapa del relevamiento'],
                ['#buscador-ecofiscalidad', 'Doctrina y novedades'],
                ['#buscador', 'Catálogo de normas'],
                ['#metodologia', 'Metodología'],
                ['#contacto', 'Contacto'],
              ].map(([href, texto]) => (
                <li key={href}>
                  <a href={href} className="hover:text-white transition-colors">
                    {texto}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="md:col-span-4">
            <div className="text-sm font-semibold uppercase tracking-wider text-white mb-3">Contacto</div>
            <p className="text-sm leading-relaxed">
              Para aportar una norma, corregir una ficha o hacer una consulta, escribí a la Secretaría de Investigación y Desarrollo:
            </p>
            <a href="mailto:seciyp@ucel.edu.ar" className="inline-block mt-2 font-mono text-sm text-white select-all hover:text-verde-ucel">
              seciyp@ucel.edu.ar
            </a>
            <p className="text-sm mt-3">Av. Pellegrini 1332, Rosario, Santa Fe.</p>
          </div>
        </div>
      </div>

      {/* Línea legal */}
      <div className="border-t border-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© {new Date().getFullYear()} Universidad del Centro Educativo Latinoamericano (UCEL)</span>
          <a href="#buscador" className="hover:text-white transition-colors">
            Descargar los datos (CSV y JSON)
          </a>
        </div>
      </div>
    </footer>
  );
};
