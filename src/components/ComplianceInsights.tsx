import React from 'react';
import { CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { ESTADOS, ESTADO_STYLE, META, RELEVAMIENTO_COMPLETO, STATS, TIPOS, TIPO_COLOR, TIPO_DESC, TIPO_LABEL } from '../data/relevamiento';

const descargarRelevamiento = () => {
  const blob = new Blob([JSON.stringify(RELEVAMIENTO_COMPLETO, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relevamiento_ecofiscal_${META.actualizado}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * "Cómo leer el relevamiento": familias de instrumentos, estados y criterio de verificación.
 * Todas las cifras se calculan del archivo de datos.
 */
export const ComplianceInsights: React.FC = () => {
  return (
    <section id="metodologia" className="py-16 md:py-24 bg-white border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div aria-hidden="true" className="h-[3px] w-[92px] bg-verde-ucel mb-4" />
          <div className="text-xs font-semibold tracking-wider uppercase text-fcjs-700 mb-2">Metodología</div>
          <h2 className="text-3xl md:text-4xl font-medium text-ucel-800 tracking-tight text-balance">Cómo leer el relevamiento</h2>
          <p className="mt-3 text-base md:text-lg text-slate-600 leading-relaxed">
            Un instrumento ecofiscal es una norma con contenido financiero público (ingreso, gasto, fondo, presupuesto o deuda) y finalidad
            ambiental. Cada ficha se clasifica en una de siete familias y lleva su estado normativo y el tipo de fuente con que se verificó.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {TIPOS.map((t) => (
            <div key={t} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TIPO_COLOR[t] }} />
                  {TIPO_LABEL[t]}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {STATS.porTipo[t] || 0}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{TIPO_DESC[t]}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Estado de cada ficha</h3>
            <ul className="space-y-2">
              {ESTADOS.map((e) => (
                <li key={e} className="flex items-center justify-between gap-3 text-sm">
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold capitalize ${ESTADO_STYLE[e] || ''}`}>{e}</span>
                  <span className="flex-1 border-b border-dotted border-slate-200" />
                  <span className="font-mono text-slate-700">{STATS.porEstado[e] || 0}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Verificación</h3>
            <p className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-ucel-600 shrink-0 mt-0.5" />
              <span>
                <strong>{STATS.fuenteOficial}</strong> fichas se cotejaron con el texto oficial (boletín oficial, legislatura, digesto o sitio de
                gobierno).
              </span>
            </p>
            <p className="flex items-start gap-2 text-sm text-slate-700">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>{STATS.aVerificar}</strong> fichas están marcadas “a verificar”: tienen datos tomados de prensa, estudios jurídicos o
                informes, o les falta confirmar número, fecha o vigencia. Conviene cotejarlas antes de citarlas.
              </span>
            </p>
            <p className="flex items-start gap-2 text-sm text-slate-700">
              <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>{META.aclaracion}</span>
            </p>
            <button
              type="button"
              onClick={descargarRelevamiento}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Descargar el relevamiento completo (JSON)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
