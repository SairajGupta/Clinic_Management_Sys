import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  Heart,
  GraduationCap,
  Stethoscope,
  Building,
  Target,
  Sparkles,
  Shield,
  Users,
  Lightbulb,
  HandHeart,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

function Timeline() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal();

  const items = [
    { year: t('about.t1Year'), title: t('about.t1Title'), desc: t('about.t1Desc'), icon: GraduationCap, color: 'from-sage to-sage-dark' },
    { year: t('about.t2Year'), title: t('about.t2Title'), desc: t('about.t2Desc'), icon: Stethoscope, color: 'from-sky to-sky-dark' },
    { year: t('about.t3Year'), title: t('about.t3Title'), desc: t('about.t3Desc'), icon: Building, color: 'from-sage-light to-sage' },
  ];

  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <h3 className="text-2xl sm:text-3xl font-extrabold text-dark mb-10 text-center">{t('about.timeline')}</h3>
      <div className="relative max-w-2xl mx-auto">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sage via-sky to-sage-light" />

        <div className="space-y-10">
          {items.map((item, i) => (
            <div key={i} className="relative flex gap-6 items-start" style={{ transitionDelay: `${i * 150}ms` }}>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md flex-shrink-0 z-10`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white rounded-lg p-5 shadow-soft border border-mint/15 hover-lift flex-1">
                <span className="text-xs font-bold text-sage-dark bg-mint/40 px-2.5 py-1 rounded-full">
                  {item.year}
                </span>
                <h4 className="text-base font-bold text-dark mt-2 mb-1">{item.title}</h4>
                <p className="text-sm text-warm-gray leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Values() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal();

  const values = [
    { icon: Heart, title: t('about.value1'), desc: t('about.value1Desc'), color: 'bg-sage/10 text-sage-dark' },
    { icon: Sparkles, title: t('about.value2'), desc: t('about.value2Desc'), color: 'bg-sky/10 text-sky-dark' },
    { icon: Shield, title: t('about.value3'), desc: t('about.value3Desc'), color: 'bg-beige text-dark-soft' },
    { icon: HandHeart, title: t('about.value4'), desc: t('about.value4Desc'), color: 'bg-mint text-sage-dark' },
    { icon: Users, title: t('about.value5'), desc: t('about.value5Desc'), color: 'bg-sage-light/20 text-sage-dark' },
    { icon: Lightbulb, title: t('about.value6'), desc: t('about.value6Desc'), color: 'bg-sky-light/20 text-sky-dark' },
  ];

  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <h3 className="text-2xl sm:text-3xl font-extrabold text-dark mb-10 text-center">{t('about.values')}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {values.map((v, i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-6 shadow-soft border border-mint/15 hover-lift"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className={`w-12 h-12 rounded-xl ${v.color.split(' ')[0]} flex items-center justify-center mb-4`}>
              <v.icon className={`w-6 h-6 ${v.color.split(' ')[1]}`} />
            </div>
            <h4 className="text-base font-bold text-dark mb-2">{v.title}</h4>
            <p className="text-sm text-warm-gray leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function About() {
  const { t } = useTranslation();
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.05);
  const { ref: missionRef, isVisible: missionVisible } = useScrollReveal();

  return (
    <>
      <Helmet>
        <title>About Dr. Kajal Patil - BHMS General Physician in Surat</title>
        <meta name="description" content="Learn about Dr. Kajal Patil, a compassionate BHMS General Physician in Surat dedicated to holistic wellness, personalized consultations, and preventive care." />
      </Helmet>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-mint-light/30 via-offwhite to-beige/20 relative overflow-hidden">
          <div className="organic-shape organic-shape-1 -top-20 -right-20" />
          <div className="organic-shape organic-shape-3 bottom-10 -left-10" />

          <div
            ref={heroRef}
            className={`relative z-10 max-w-6xl mx-auto transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Doctor Image */}
              <div className="flex justify-center">
                <div className="relative w-72 h-72 sm:w-[400px] sm:h-[400px] lg:w-[480px] lg:h-[480px] rounded-xl bg-gradient-to-br from-mint to-sage-light/40 overflow-hidden shadow-elevated border-4 border-white">
                  <img 
                    src="/Home/img1.jpg" 
                    alt="Dr. Kajal Patil" 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mint/60 text-sage-dark text-sm font-semibold mb-4">
                  <Heart className="w-4 h-4" fill="currentColor" />
                  BHMS • General Physician
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark mb-6">
                  {t('about.title')}
                </h1>
                <p className="text-base text-warm-gray leading-relaxed mb-4">{t('about.bio1')}</p>
                <p className="text-base text-warm-gray leading-relaxed mb-4">{t('about.bio2')}</p>
                <p className="text-base text-warm-gray leading-relaxed">{t('about.bio3')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="section-padding bg-offwhite relative leaf-pattern">
          <div
            ref={missionRef}
            className={`relative z-10 max-w-4xl mx-auto text-center transition-all duration-700 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="bg-gradient-to-br from-sage/5 to-sky/5 rounded-xl p-8 sm:p-12 border border-mint/20 shadow-soft">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-sage to-sage-dark mx-auto flex items-center justify-center mb-6 shadow-md">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-dark mb-4">{t('about.mission')}</h3>
              <p className="text-base text-warm-gray leading-relaxed max-w-2xl mx-auto">{t('about.missionText')}</p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-gradient-to-br from-beige/20 via-offwhite to-mint-light/20">
          <div className="max-w-6xl mx-auto">
            <Values />
          </div>
        </section>

        {/* Timeline */}
        <section className="section-padding bg-offwhite relative leaf-pattern">
          <div className="relative z-10 max-w-6xl mx-auto">
            <Timeline />
          </div>
        </section>
      </main>
    </>
  );
}
