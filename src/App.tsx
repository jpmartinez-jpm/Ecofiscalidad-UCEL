import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { UnifiedEcofiscalMap } from './components/UnifiedEcofiscalMap';
import { BuscadorEcofiscalidad } from './components/BuscadorEcofiscalidad';
import { SearchAndFilters } from './components/SearchAndFilters';
import { ComplianceInsights } from './components/ComplianceInsights';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { NormDetailModal } from './components/NormDetailModal';
import { PROVINCES, INSTRUMENTOS } from './data/ecofiscalData';
import { Instrumento } from './types/ecofiscal';

export default function App() {
  // Santa Fe es la provincia de referencia del proyecto.
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('santa-fe');
  const [selectedLocalityId, setSelectedLocalityId] = useState<string>('all');
  const [selectedNormModal, setSelectedNormModal] = useState<Instrumento | null>(null);

  const handleSelectProvince = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
  };

  const handleSelectLocality = (localityId: string, provinceId: string) => {
    setSelectedLocalityId(localityId);
    if (provinceId && provinceId !== 'all') {
      setSelectedProvinceId(provinceId);
    }
  };

  const handleApplyFilterToSearch = (provinceId: string, localityId?: string) => {
    setSelectedProvinceId(provinceId);
    setSelectedLocalityId(localityId || 'all');
    const searchSection = document.getElementById('buscador');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-fcjs-100 selection:text-fcjs-900">
      <Header />

      <Hero />

      {/* Mapa: límites IGN, municipios relevados y novedades */}
      <UnifiedEcofiscalMap
        provinces={PROVINCES}
        norms={INSTRUMENTOS}
        selectedProvinceId={selectedProvinceId}
        selectedLocalityId={selectedLocalityId}
        onSelectProvince={handleSelectProvince}
        onSelectLocality={handleSelectLocality}
        onViewNormDetails={(norm) => setSelectedNormModal(norm)}
        onApplyFilterToSearch={handleApplyFilterToSearch}
      />

      {/* Buscador de doctrina, jurisprudencia y papers */}
      <BuscadorEcofiscalidad />

      {/* Catálogo del relevamiento: Nación, 24 jurisdicciones y municipios */}
      <SearchAndFilters
        norms={INSTRUMENTOS}
        provinces={PROVINCES}
        selectedProvinceId={selectedProvinceId}
        selectedLocalityId={selectedLocalityId}
        onSelectProvince={handleSelectProvince}
        onSelectLocality={handleSelectLocality}
        onOpenNormDetail={(norm) => setSelectedNormModal(norm)}
      />

      {/* Cómo leer el relevamiento */}
      <ComplianceInsights />

      <ContactSection />

      <Footer />

      <NormDetailModal norm={selectedNormModal} onClose={() => setSelectedNormModal(null)} />
    </div>
  );
}
