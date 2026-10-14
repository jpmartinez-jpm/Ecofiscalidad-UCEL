import React, { useEffect } from 'react';
import { X, ExternalLink, AlertCircle, FileText, CheckCircle, MapPin } from 'lucide-react';
import { Instrumento } from '../types/ecofiscal';
import { ESTADO_STYLE, TIPO_COLOR, TIPO_LABEL, necesitaCotejo, urlSegura } from '../data/relevamiento';

interface NormDetailModalProps {
  norm: Instrumento | null;
  onClose: () => void;
}

const NIVEL_LABEL: Record<string, string> = { nacional: 'Nacional', provincial: 'Provincial', municipal: 'Municipal' };

export const NormDetailModal: React.FC<NormDetailModalProps> = ({ norm, onClose }) => {
  useEffect(() => {
    if (!norm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [norm, onClose]);

  if (!norm) return null;

  const fuente = urlSegura(norm.fuente);
  let dominio = '';
  try {
    dominio = fuente ? new URL(fuente).hostname.replace(/^www\./, '') : '';
  } catch {
    dominio = '';
  }
  const lugar = norm.nivel === 'municipal' && norm.municipio ? `${norm.municipio}, ${norm.jurisdiccion}` : norm.jurisdiccion;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ficha-titulo"
      >
        {/* Encabezado */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2 min-w-0 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-ucel-700 shrink-0" />
            <span className="font-semibold text-slate-700 truncate">{lugar}</span>
            <span className="text-slate-300">·</span>
            <span className="shrink-0">Nivel {NIVEL_LABEL[norm.nivel] || norm.nivel}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            aria-label="Cerrar ficha"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <div className="font-mono text-xs font-semibold text-ucel-800 mb-2 break-words">{norm.norma}</div>
            <h2 id="ficha-titulo" className="text-xl md:text-2xl font-medium text-ucel-800 leading-snug">
              {norm.titulo}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-white"
                style={{ backgroundColor: TIPO_COLOR[norm.tipo] || '#64748b' }}
              >
                {TIPO_LABEL[norm.tipo] || norm.tipo}
              </span>
              <span className={`px-2.5 py-1 rounded-full border font-semibold capitalize ${ESTADO_STYLE[norm.estado] || ESTADO_STYLE['a verificar']}`}>
                {norm.estado}
              </span>
              {norm.verificacion && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 text-slate-600">
                  {norm.verificacion === 'fuente oficial' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-ucel-600" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  {norm.verificacion === 'fuente oficial' ? 'Texto oficial consultado' : 'Solo fuente secundaria'}
                </span>
              )}
            </div>
          </div>

          {necesitaCotejo(norm) && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>Dato a cotejar con el texto oficial antes de citarlo.</strong> La ficha está marcada como "a verificar"
                o se apoya solo en una fuente secundaria.
              </p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Qué establece</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {norm.descripcion}
            </p>
          </div>

          {norm.nota && (
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Nota de verificación</h4>
              <p className="text-xs text-slate-600 leading-relaxed border-l-2 border-slate-200 pl-3">{norm.nota}</p>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 font-mono">Ficha {norm.id}</span>
          <div className="flex items-center gap-2">
            {fuente && (
              <a
                href={fuente}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver fuente{dominio ? ` (${dominio})` : ''}</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cerrar ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
