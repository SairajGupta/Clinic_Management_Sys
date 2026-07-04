import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  FileText,
  Download,
  Search,
  AlertCircle,
  Printer,
  HelpCircle,
  Pill,
  Clock,
  User,
  RefreshCw,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface Medication {
  name: string;
  dosage: string;
  duration: string;
}

interface PrescriptionData {
  success: boolean;
  prescription_id: string;
  patient_name: string;
  date: string;
  doctor: string;
  medications: Medication[];
  notes: string;
}

export default function Prescription() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.05);
  const [prescriptionId, setPrescriptionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrescriptionData | null>(null);
  const [error, setError] = useState('');

  const [searchParams] = useSearchParams();

  const handleSearch = async (searchId: string = prescriptionId) => {
    if (!searchId.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setPrescriptionId(searchId);

    try {
      const response = await fetch(
        `http://localhost:8000/api/prescriptions/${searchId.trim()}`
      );
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(t('prescription.notFound'));
      }
    } catch {
      // Fallback mock data for demo
      if (prescriptionId.trim().toUpperCase() === 'RX-001') {
        setResult({
          success: true,
          prescription_id: 'RX-001',
          patient_name: 'Sample Patient',
          date: '2026-06-15',
          doctor: 'Dr. Kajal Patil (BHMS)',
          medications: [
            { name: 'Arnica Montana 30C', dosage: '3 times daily', duration: '7 days' },
            { name: 'Bryonia Alba 200C', dosage: 'Twice daily', duration: '5 days' },
          ],
          notes: 'Rest well. Follow up after 1 week. Avoid cold foods.',
        });
      } else {
        setError(t('prescription.notFound'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      handleSearch(idFromUrl);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>Prescription Portal - Dr. Kajal Patil | Surat</title>
        <meta name="description" content="Access and download your prescriptions from Dr. Kajal Patil's clinic. Enter your Prescription ID to view your medical prescription." />
      </Helmet>

      <main className="pt-20">
        <section className="section-padding bg-gradient-to-br from-mint-light/30 via-offwhite to-beige/20 relative overflow-hidden min-h-screen">
          <div className="organic-shape organic-shape-1 -top-20 -right-32" />
          <div className="organic-shape organic-shape-3 bottom-20 -left-20" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div ref={ref} className={`text-center mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark mb-4">
                {t('prescription.title')}
              </h1>
              <p className="text-warm-gray text-lg max-w-xl mx-auto">
                {t('prescription.subtitle')}
              </p>
            </div>

            {/* Search Box */}
            <div className={`bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-mint/20 mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
              <p className="text-sm text-warm-gray mb-5 text-center">{t('prescription.info')}</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                  <input
                    type="text"
                    className="input-field !pl-12"
                    placeholder={t('prescription.inputPlaceholder')}
                    value={prescriptionId}
                    onChange={(e) => setPrescriptionId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(prescriptionId)}
                  />
                </div>
                <button
                  onClick={() => handleSearch(prescriptionId)}
                  className="btn-primary !px-8"
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  {loading ? t('prescription.searching') : t('prescription.download')}
                </button>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 rounded-xl px-4 py-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Prescription Result */}
            {result && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-mint/20 animate-scale-in print:shadow-none print:border-none print-area">
                {/* Header */}
                <div className="text-center pb-6 border-b border-mint/20 mb-6">
                  <h2 className="text-xl font-extrabold text-dark">{t('hero.clinicName')}</h2>
                  <p className="text-sm text-sage-dark font-medium">{result.doctor}</p>
                  <p className="text-xs text-warm-gray mt-1">{t('location.address')}</p>
                </div>

                {/* Patient Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sage" />
                    <div>
                      <p className="text-xs text-warm-gray">{t('prescription.patient')}</p>
                      <p className="text-sm font-semibold text-dark">{result.patient_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sage" />
                    <div>
                      <p className="text-xs text-warm-gray">{t('prescription.date')}</p>
                      <p className="text-sm font-semibold text-dark">{result.date}</p>
                    </div>
                  </div>
                </div>

                {/* Medications Table */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="w-5 h-5 text-sage-dark" />
                    <h3 className="text-base font-bold text-dark">{t('prescription.medications')}</h3>
                  </div>
                  <div className="bg-offwhite rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-mint/30">
                          <th className="text-left py-3 px-4 text-dark font-semibold">{t('prescription.medicine')}</th>
                          <th className="text-left py-3 px-4 text-dark font-semibold">{t('prescription.dosage')}</th>
                          <th className="text-left py-3 px-4 text-dark font-semibold">{t('prescription.duration')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.medications.map((med, i) => (
                          <tr key={i} className="border-t border-mint/15">
                            <td className="py-3 px-4 text-dark-soft font-medium">{med.name}</td>
                            <td className="py-3 px-4 text-warm-gray">{med.dosage}</td>
                            <td className="py-3 px-4 text-warm-gray">{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-beige/50 rounded-xl p-4 mb-6">
                  <p className="text-xs font-semibold text-dark mb-1">{t('prescription.notes')}</p>
                  <p className="text-sm text-warm-gray">{result.notes}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                  <button onClick={handlePrint} className="btn-primary flex-1 justify-center">
                    <Printer className="w-4 h-4" />
                    {t('prescription.print')}
                  </button>
                  <button onClick={handlePrint} className="btn-secondary flex-1 justify-center">
                    <Download className="w-4 h-4" />
                    {t('prescription.download')}
                  </button>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className={`mt-8 bg-sky/5 rounded-2xl p-6 border border-sky/15 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-sky-dark flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-dark mb-1">{t('prescription.howTo')}</h4>
                  <p className="text-sm text-warm-gray leading-relaxed">{t('prescription.howToDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
