import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MessageCircle,
  Shield,
  Stethoscope,
  Heart,
  Clock,
  UserCheck,
  Activity,
  Users,
  ArrowRight,
  Star,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

/* =============== HERO SECTION =============== */
function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-offwhite via-mint-light/30 to-offwhite">
      {/* Organic Shapes */}
      <div className="organic-shape organic-shape-1 -top-32 -right-32" />
      <div className="organic-shape organic-shape-2 top-1/2 -left-24" />
      <div className="organic-shape organic-shape-3 bottom-20 right-1/4" />

      {/* Leaf pattern overlay */}
      <div className="absolute inset-0 leaf-pattern" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 lg:pt-32 lg:pb-32">

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="flex flex-col items-start gap-1.5 text-dark-soft text-sm font-medium mb-5 animate-fade-in-down bg-white/60 px-5 py-3 rounded-2xl border border-sage/20 text-left w-full max-w-[280px] sm:max-w-none shadow-sm">
              <div className="flex items-start sm:items-center gap-2">
                <Clock className="w-4 h-4 text-sage mt-0.5 sm:mt-0 flex-shrink-0" />
                <span className="leading-tight">{t('location.monSat')}</span>
              </div>
              <div className="flex items-start sm:items-center gap-2 text-sage-dark ml-0 sm:ml-6">
                <span className="w-4 h-4 sm:hidden inline-block flex-shrink-0" />
                <span className="leading-tight font-semibold">{t('location.sunday')}</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mint/60 text-sage-dark text-sm font-semibold mb-6 animate-fade-in-down">
              <Heart className="w-4 h-4" fill="currentColor" />
              {t('hero.clinicName')}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark leading-[1.15] mb-6 animate-fade-in-up">
              {t('hero.headline').split(' ').map((word, i) => (
                <span key={i}>
                  {['Compassionate', 'करुणामय', 'કરુણાપૂર્ણ', 'करुणामय'].some(w => word.includes(w)) ||
                   ['Care', 'देखभाल', 'સંભાળ', 'काळजी'].some(w => word.includes(w)) ||
                   ['Life', 'जीवन', 'જીવનના', 'जीवनाच्या'].some(w => word.includes(w))
                    ? <span className="gradient-text">{word} </span>
                    : `${word} `
                  }
                </span>
              ))}
            </h1>

            <p className="text-lg text-warm-gray leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up delay-200" style={{ opacity: 0 }}>
              {t('hero.subheadline')}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up delay-300" style={{ opacity: 0 }}>
              <Link to="/appointment" className="btn-primary text-base px-8 py-3.5">
                <Calendar className="w-5 h-5" />
                {t('hero.bookAppointment')}
              </Link>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-base px-8 py-3.5"
              >
                <MessageCircle className="w-5 h-5" />
                {t('hero.whatsappConsult')}
              </a>
            </div>
          </div>

          {/* Doctor Image / Visual */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in-right delay-300" style={{ opacity: 0 }}>
            <div className="relative">
              {/* Background Circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-mint via-mint-light to-sage-light/30 scale-110 blur-2xl opacity-60" />

              {/* Doctor Image Container */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-mint to-mint-light overflow-hidden border-4 border-white shadow-elevated">
                {/* Placeholder Doctor Illustration */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-mint/80 to-sage-light/40">
                  <Stethoscope className="w-20 h-20 text-sage-dark/30 mb-2" />
                  <p className="text-sage-dark/50 font-heading text-sm font-semibold">Dr. Kajal Patil</p>
                  <p className="text-sage-dark/35 text-xs">BHMS</p>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-card px-4 py-3 animate-float hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark">BHMS</p>
                    <p className="text-[10px] text-warm-gray">Verified</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-2 -left-6 bg-white rounded-2xl shadow-card px-4 py-3 animate-float delay-300 hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-sky-dark" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark">Patient Care</p>
                    <p className="text-[10px] text-warm-gray">100% Focus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
        <ChevronDown className="w-6 h-6 text-sage/50" />
      </div>
    </section>
  );
}

/* =============== TRUST INDICATORS =============== */
function TrustIndicators() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal();

  const indicators = [
    { icon: Shield, titleKey: 'trust.bhms', descKey: 'trust.bhmsDesc', color: 'from-sage to-sage-dark' },
    { icon: Stethoscope, titleKey: 'trust.gp', descKey: 'trust.gpDesc', color: 'from-sky to-sky-dark' },
    { icon: Heart, titleKey: 'trust.patientCare', descKey: 'trust.patientCareDesc', color: 'from-sage-light to-sage' },
    { icon: Clock, titleKey: 'trust.sameDay', descKey: 'trust.sameDayDesc', color: 'from-sky-light to-sky' },
  ];

  return (
    <section className="relative mt-12 lg:-mt-16 z-20 px-4 sm:px-6 lg:px-8">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {indicators.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-card hover-lift text-center"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-md`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-bold text-dark mb-1">{t(item.titleKey)}</h3>
            <p className="text-xs text-warm-gray leading-relaxed">{t(item.descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =============== FEATURES GRID =============== */
function FeaturesGrid() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal();

  const features = [
    {
      icon: UserCheck,
      titleKey: 'features.personalizedTreatment',
      descKey: 'features.personalizedTreatmentDesc',
      accent: 'bg-sage/10 text-sage-dark',
      iconBg: 'bg-sage/15',
    },
    {
      icon: Activity,
      titleKey: 'features.preventiveHealthcare',
      descKey: 'features.preventiveHealthcareDesc',
      accent: 'bg-sky/10 text-sky-dark',
      iconBg: 'bg-sky/15',
    },
    {
      icon: Heart,
      titleKey: 'features.followUpCare',
      descKey: 'features.followUpCareDesc',
      accent: 'bg-beige text-dark-soft',
      iconBg: 'bg-beige-dark/30',
    },
    {
      icon: Users,
      titleKey: 'features.familyMedicine',
      descKey: 'features.familyMedicineDesc',
      accent: 'bg-mint text-sage-dark',
      iconBg: 'bg-mint',
    },
  ];

  return (
    <section className="pt-8 md:pt-12 pb-16 md:pb-24 bg-offwhite relative leaf-pattern">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
            {t('features.title')}
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-6 shadow-soft hover-lift border border-mint/20 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center mb-5`}>
                <f.icon className={`w-7 h-7 ${f.accent.split(' ')[1]}`} />
              </div>
              <h3 className="text-base font-bold text-dark mb-2">{t(f.titleKey)}</h3>
              <p className="text-sm text-warm-gray leading-relaxed">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =============== ABOUT INTRO =============== */
function AboutIntro() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="section-padding bg-gradient-to-br from-beige/20 via-offwhite to-mint-light/20 relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="order-2 lg:order-1 relative">
            <div className="relative w-full max-w-md mx-auto h-80 sm:h-96 rounded-3xl bg-gradient-to-br from-mint to-sage-light/40 overflow-hidden shadow-elevated border-4 border-white flex items-center justify-center">
                <Stethoscope className="w-16 h-16 text-sage-dark/25 mb-2" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-sage-dark/40 font-heading text-sm font-semibold">Dr. Kajal Patil</p>
                  <p className="text-sage-dark/30 text-xs">BHMS</p>
                </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
              {t('about.title')}
            </h2>
            <p className="text-warm-gray text-lg mb-6 leading-relaxed">
              {t('about.bio1')}
            </p>
            <p className="text-warm-gray text-base mb-8 leading-relaxed">
              {t('about.bio2')}
            </p>
            <Link to="/about" className="btn-secondary">
              Know More <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============== SERVICES INTRO =============== */
function ServicesIntro() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal();
  
  const services = [
    { key: 'generalConsultation', icon: Stethoscope, color: 'from-sage/10 to-mint/30' },
    { key: 'feverManagement', icon: Activity, color: 'from-sky/10 to-sky-light/20' },
    { key: 'preventiveHealthcare', icon: Shield, color: 'from-beige to-beige-dark/20' },
    { key: 'womensWellness', icon: Heart, color: 'from-mint to-mint-light' },
  ];

  return (
    <section className="pt-16 md:pt-24 pb-8 md:pb-12 bg-offwhite relative overflow-hidden">
      <div className="organic-shape organic-shape-2 top-20 right-10 opacity-[0.05]" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
            {t('services.title')}
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto mb-10">
            {t('services.subtitle')}
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {services.map((svc, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-soft hover-lift border border-mint/15 text-left transition-all duration-700" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center mb-4`}>
                  <svc.icon className="w-6 h-6 text-sage-dark" />
                </div>
                <h3 className="text-base font-bold text-dark mb-2">{t(`services.${svc.key}`)}</h3>
                <p className="text-sm text-warm-gray mb-4">{t(`services.${svc.key}Desc`)}</p>
              </div>
            ))}
          </div>
          
          <Link to="/services" className="btn-secondary">
            See All Services <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =============== TESTIMONIALS PREVIEW =============== */
function TestimonialsPreview() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal();

  const reviews = [
    { name: t('testimonialsPage.t1Name'), text: t('testimonialsPage.t1'), condition: t('testimonialsPage.t1Condition'), rating: 5 },
    { name: t('testimonialsPage.t2Name'), text: t('testimonialsPage.t2'), condition: t('testimonialsPage.t2Condition'), rating: 5 },
    { name: t('testimonialsPage.t3Name'), text: t('testimonialsPage.t3'), condition: t('testimonialsPage.t3Condition'), rating: 5 },
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-mint-light/40 via-offwhite to-beige/30 relative overflow-hidden">
      <div className="organic-shape organic-shape-2 top-10 -right-20 opacity-[0.04]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-6 shadow-soft hover-lift border border-mint/15 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${200 + i * 150}ms` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-dark-soft leading-relaxed mb-5 italic">
                "{review.text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-mint/20">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-light to-mint flex items-center justify-center text-sage-dark font-bold text-sm">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-dark">{review.name}</p>
                  <p className="text-xs text-warm-gray">{review.condition}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/testimonials" className="btn-secondary">
            {t('testimonials.viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =============== FAQ PREVIEW =============== */
function FAQPreview() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: t('faqSection.q1'), a: t('faqSection.a1') },
    { q: t('faqSection.q2'), a: t('faqSection.a2') },
    { q: t('faqSection.q3'), a: t('faqSection.a3') },
  ];

  return (
    <section className="section-padding bg-offwhite relative leaf-pattern">
      <div className="relative z-10 max-w-3xl mx-auto">
        <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
            {t('faqSection.title')}
          </h2>
          <p className="text-warm-gray text-lg">
            {t('faqSection.subtitle')}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl shadow-soft border border-mint/15 overflow-hidden transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-mint/5 transition-colors"
              >
                <span className="text-sm font-semibold text-dark">{faq.q}</span>
                {openIndex === i ? (
                  <ChevronUp className="w-5 h-5 text-sage flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-warm-gray flex-shrink-0" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-6 pb-5 text-sm text-warm-gray leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/faq" className="btn-secondary">
            {t('faqSection.viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =============== LOCATION PREVIEW =============== */
function LocationPreview() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="section-padding bg-gradient-to-br from-beige/40 via-offwhite to-mint-light/20 relative">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
            {t('location.title')}
          </h2>
          <p className="text-warm-gray text-lg">{t('location.subtitle')}</p>
        </div>

        <div className={`grid lg:grid-cols-2 gap-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-card border border-mint/20 h-72 lg:h-auto">
            <iframe
              title="Clinic Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.288!2d72.7929!3d21.1702!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDEwJzEyLjciTiA3MsKwNDcnMzQuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '280px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-mint/15 flex items-start gap-4 hover-lift">
              <div className="w-11 h-11 rounded-xl bg-sage/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-sage-dark" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-dark mb-1">Address</h4>
                <p className="text-sm text-warm-gray leading-relaxed">{t('location.address')}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-soft border border-mint/15 flex items-start gap-4 hover-lift">
              <div className="w-11 h-11 rounded-xl bg-sky/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-sky-dark" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-dark mb-1">Phone</h4>
                <a href="tel:+919876543210" className="text-sm text-warm-gray hover:text-sage-dark transition-colors">
                  {t('location.phone')}
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-soft border border-mint/15 flex items-start gap-4 hover-lift">
              <div className="w-11 h-11 rounded-xl bg-beige flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-dark-soft" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-dark mb-1">Email</h4>
                <a href="mailto:dr.kajalpatil@clinic.com" className="text-sm text-warm-gray hover:text-sage-dark transition-colors">
                  {t('location.email')}
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-soft border border-mint/15 flex items-start gap-4 hover-lift">
              <div className="w-11 h-11 rounded-xl bg-mint flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-sage-dark" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-dark mb-1">{t('location.timings')}</h4>
                <p className="text-sm text-warm-gray">{t('location.monSat')}</p>
                <p className="text-sm text-warm-gray">{t('location.sunday')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============== APPOINTMENT CTA =============== */
function AppointmentCTA() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-sage-dark via-sage to-sage-dark" />
      <div className="organic-shape organic-shape-1 top-0 right-0 opacity-[0.08] !bg-white" />
      <div className="organic-shape organic-shape-2 bottom-0 left-0 opacity-[0.06] !bg-white" />

      <div
        ref={ref}
        className={`relative z-10 max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          {t('ctaSection.title')}
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
          {t('ctaSection.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/appointment"
            className="bg-white text-sage-dark px-8 py-3.5 rounded-full font-bold font-[family-name:var(--font-heading)] text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            {t('ctaSection.bookNow')}
          </Link>
          <a
            href="tel:+919876543210"
            className="text-white/90 hover:text-white font-semibold text-base inline-flex items-center gap-2 transition-colors"
          >
            <Phone className="w-5 h-5" />
            {t('ctaSection.callUs')}: +91 98765 43210
          </a>
        </div>
      </div>
    </section>
  );
}

/* =============== HOME PAGE =============== */
export default function Home() {
  return (
    <main>
      <Hero />
      <TrustIndicators />
      <AboutIntro />
      <ServicesIntro />
      <FeaturesGrid />
      <TestimonialsPreview />
      <FAQPreview />
      <LocationPreview />
      <AppointmentCTA />
    </main>
  );
}
