import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  Stethoscope,
  Thermometer,
  Activity,
  ShieldCheck,
  Heart,
  ClipboardCheck,
  MessageSquare,
  CalendarCheck,
  Syringe,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';

const serviceIcons = [
  Stethoscope,
  Thermometer,
  Activity,
  ShieldCheck,
  Heart,
  ClipboardCheck,
  MessageSquare,
  CalendarCheck,
  Syringe,
  Users,
];

const serviceKeys = [
  'generalConsultation',
  'feverManagement',
  'lifestyleDisorders',
  'preventiveHealthcare',
  'womensWellness',
  'routineCheckups',
  'healthCounseling',
  'followUpVisits',
  'vaccination',
  'familyHealthcare',
];

const cardColors = [
  'from-sage/10 to-mint/30',
  'from-sky/10 to-sky-light/20',
  'from-beige to-beige-dark/20',
  'from-mint to-mint-light',
  'from-sage-light/20 to-mint/20',
  'from-sky-light/10 to-sky/10',
  'from-beige/50 to-beige',
  'from-mint-light to-mint/50',
  'from-sage/5 to-sage-light/20',
  'from-sky/5 to-mint/20',
];

export default function Services() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.05);

  return (
    <>
      <Helmet>
        <title>Services - Dr. Kajal Patil | General Physician Surat</title>
        <meta name="description" content="Explore comprehensive healthcare services by Dr. Kajal Patil in Surat — General Consultation, Preventive Healthcare, Women's Wellness, Family Medicine, and more." />
      </Helmet>

      <main className="pt-20">
        <section className="section-padding bg-gradient-to-br from-mint-light/30 via-offwhite to-beige/20 relative overflow-hidden">
          <div className="organic-shape organic-shape-1 -top-20 -right-32" />
          <div className="organic-shape organic-shape-2 bottom-20 -left-20" />

          <div className="relative z-10 max-w-6xl mx-auto">
            <div ref={ref} className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark mb-4">
                {t('services.title')}
              </h1>
              <p className="text-warm-gray text-lg max-w-2xl mx-auto">
                {t('services.subtitle')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceKeys.map((key, i) => {
                const Icon = serviceIcons[i];
                return (
                  <div
                    key={key}
                    className={`bg-white rounded-2xl p-6 shadow-soft hover-lift border border-mint/15 transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${200 + i * 80}ms` }}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cardColors[i]} flex items-center justify-center mb-5`}>
                      <Icon className="w-7 h-7 text-sage-dark" />
                    </div>
                    <h3 className="text-base font-bold text-dark mb-2">
                      {t(`services.${key}`)}
                    </h3>
                    <p className="text-sm text-warm-gray leading-relaxed mb-4">
                      {t(`services.${key}Desc`)}
                    </p>
                    <Link
                      to="/appointment"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-sage-dark hover:text-sage transition-colors"
                    >
                      Book Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
