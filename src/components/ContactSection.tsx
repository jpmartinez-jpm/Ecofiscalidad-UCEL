import React, { useState } from 'react';
import { Mail, Send, HelpCircle, PlusCircle, PencilLine, Building2 } from 'lucide-react';
import { PROVINCES } from '../data/ecofiscalData';

const CORREO = 'seciyp@ucel.edu.ar';

type Motivo = 'consulta' | 'aporte' | 'correccion';

const MOTIVOS: Record<Motivo, { label: string; icon: React.ReactNode; ayuda: string; asunto: string }> = {
  consulta: {
    label: 'Consulta',
    icon: <HelpCircle className="w-4 h-4 text-emerald-700" />,
    ayuda: 'Preguntas sobre el relevamiento, la metodología o el proyecto.',
    asunto: 'Consulta sobre el relevamiento ecofiscal',
  },
  aporte: {
    label: 'Aportar una norma',
    icon: <PlusCircle className="w-4 h-4 text-emerald-700" />,
    ayuda: 'Una ley, ordenanza o decreto con contenido fiscal ambiental que no esté en el catálogo. Indicá número, año y enlace.',
    asunto: 'Aporte de norma al relevamiento ecofiscal',
  },
  correccion: {
    label: 'Corregir una ficha',
    icon: <PencilLine className="w-4 h-4 text-emerald-700" />,
    ayuda: 'Un dato desactualizado o incorrecto. Indicá el código de la ficha (aparece al pie de cada una) y la fuente.',
    asunto: 'Corrección de ficha del relevamiento ecofiscal',
  },
};

const EQUIPO: [string, string][] = [
  ['Sergio Hernán Mas Varela', 'Director'],
  ['Lionel Matías Orso', 'Investigador'],
  ['Federico Ávila', 'Investigador'],
  ['Juan Pablo Martínez', 'Investigador'],
  ['Esteban Lombardi', 'Alumno'],
  ['Agostina Palma', 'Alumna'],
  ['Emiliana Bustamante', 'Alumna'],
];

/**
 * Contacto: el formulario no envía datos a ningún servidor; arma un correo en el programa de mail
 * de quien escribe, dirigido a la Secretaría de Investigación de la UCEL.
 */
export const ContactSection: React.FC = () => {
  const [motivo, setMotivo] = useState<Motivo>('consulta');
  const [nombre, setNombre] = useState('');
  const [organizacion, setOrganizacion] = useState('');
  const [provincia, setProvincia] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !mensaje.trim()) {
      setError('Completá tu nombre y el mensaje.');
      return;
    }
    setError(null);
    const cuerpo = [
      `Motivo: ${MOTIVOS[motivo].label}`,
      `Nombre: ${nombre.trim()}`,
      organizacion.trim() ? `Organización: ${organizacion.trim()}` : '',
      provincia ? `Provincia: ${provincia}` : '',
      localidad.trim() ? `Localidad: ${localidad.trim()}` : '',
      '',
      mensaje.trim(),
    ]
      .filter((l, i, arr) => l !== '' || (i > 0 && arr[i - 1] !== ''))
      .join('\n');
    window.location.href = `mailto:${CORREO}?subject=${encodeURIComponent(MOTIVOS[motivo].asunto)}&body=${encodeURIComponent(cuerpo)}`;
    setAbierto(true);
  };

  const campo = 'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600';

  return (
    <section id="contacto" className="py-16 md:py-24 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-2">Contacto</div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-balance">Consultas, aportes y correcciones</h2>
          <p className="mt-3 text-base md:text-lg text-slate-600 leading-relaxed">
            El relevamiento se mejora con los aportes de quienes trabajan con estas normas. Si encontrás una norma que falta o un dato que cambió,
            escribinos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs">
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-200/80 rounded-xl mb-3" role="group" aria-label="Motivo">
              {(Object.keys(MOTIVOS) as Motivo[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={motivo === m}
                  onClick={() => setMotivo(m)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                    motivo === m ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {MOTIVOS[m].icon}
                  <span className="truncate">{MOTIVOS[m].label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mb-5">{MOTIVOS[motivo].ayuda}</p>

            <form onSubmit={enviar} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs font-semibold text-slate-700">
                  Nombre *
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className={`${campo} mt-1`} autoComplete="name" />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Organización
                  <input
                    type="text"
                    value={organizacion}
                    onChange={(e) => setOrganizacion(e.target.value)}
                    placeholder="Municipio, universidad, estudio…"
                    className={`${campo} mt-1`}
                    autoComplete="organization"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Provincia
                  <select value={provincia} onChange={(e) => setProvincia(e.target.value)} className={`${campo} mt-1`}>
                    <option value="">Sin indicar</option>
                    <option value="Nación">Nación</option>
                    {PROVINCES.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Localidad
                  <input type="text" value={localidad} onChange={(e) => setLocalidad(e.target.value)} className={`${campo} mt-1`} />
                </label>
              </div>

              <label className="block text-xs font-semibold text-slate-700">
                Mensaje *
                <textarea
                  rows={5}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder={
                    motivo === 'aporte'
                      ? 'Norma, número y año, qué establece y enlace al boletín oficial o digesto.'
                      : motivo === 'correccion'
                      ? 'Código de la ficha, qué dato corregir y la fuente.'
                      : 'Tu consulta.'
                  }
                  className={`${campo} mt-1 leading-relaxed`}
                />
              </label>

              {error && <p className="text-xs text-rose-700 font-medium">{error}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Preparar el correo</span>
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Se abre tu programa de correo con el mensaje armado para {CORREO}. Este sitio no guarda ni envía tus datos.
                </p>
                {abierto && (
                  <p className="text-[11px] text-emerald-800 text-center mt-2">
                    Si no se abrió el correo, escribí directamente a <strong>{CORREO}</strong>.
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Proyecto de investigación “Instrumentos ecofiscales”</h3>
                  <div className="text-xs text-slate-500 font-medium">Facultad de Ciencias Jurídicas y Sociales · UCEL, Rosario</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evolución, diagnóstico y evaluación de la viabilidad económica y jurídica de los instrumentos ecofiscales, con especial referencia a la
                provincia de Santa Fe. Cátedra de Finanzas Públicas y Derecho Tributario.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {EQUIPO.map(([n, r]) => (
                  <li key={n} className="flex flex-col">
                    <span className="font-semibold text-slate-800">{n}</span>
                    <span className="text-[11px] text-slate-500">{r}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Secretaría de Investigación y Desarrollo: <a className="font-mono text-slate-800 hover:text-emerald-800" href={`mailto:${CORREO}`}>{CORREO}</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
