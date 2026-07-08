import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';

const serviceImages = [
  '/ServicesSec/gencon.jpg',
  '/ServicesSec/f&i.jpg',
  '/ServicesSec/ld.jpg',
  '/ServicesSec/phc.jpg',
  '/ServicesSec/women-wellness (1).jpg',
  '/ServicesSec/RoutineHc (1).jpg',
  '/ServicesSec/hc.jfif',
  '/ServicesSec/followv.jpg',
  '/ServicesSec/Vaccination.jpg',
  '/ServicesSec/famhcare.png',
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceKeys.map((key, i) => {
                return (
                  <div
                    key={key}
                    className={`bg-white rounded-3xl shadow-card hover-lift border border-mint/20 transition-all duration-700 flex flex-col overflow-hidden group ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${200 + i * 80}ms` }}
                  >
                    <div className="w-full h-56 relative overflow-hidden">
                      <div className="absolute inset-0 bg-sage-dark/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
                      <img src={serviceImages[i]} alt={t(`services.${key}`)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-dark mb-3 group-hover:text-sage-dark transition-colors">
                        {t(`services.${key}`)}
                      </h3>
                      <p className="text-sm text-warm-gray leading-relaxed mb-8 flex-1">
                        {t(`services.${key}Desc`)}
                      </p>
                      <Link
                        to="/appointment"
                        className="inline-flex items-center justify-center w-full py-3 rounded-3xl bg-mint/30 text-sage-dark font-bold hover:bg-mint hover:shadow-md transition-all duration-300 group/btn"
                      >
                        {t('nav.bookNow')} <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
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
