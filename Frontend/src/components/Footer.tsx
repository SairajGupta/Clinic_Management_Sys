import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
  Leaf,
  ArrowUp,
} from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-br from-dark to-dark-soft text-white/80 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sage via-sky to-sage" />
      <div className="organic-shape organic-shape-2 -top-20 -right-20 opacity-[0.03]" />
      <div className="organic-shape organic-shape-3 bottom-10 -left-10 opacity-[0.03]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <span className="block text-base font-bold text-white">
                  Dr. Kajal Patil
                </span>
                <span className="block text-xs text-sage-light">
                  BHMS • General Physician
                </span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mt-3">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-1 mt-4">
              <Leaf className="w-4 h-4 text-sage-light" />
              <span className="text-xs text-sage-light font-medium">
                Healing with compassion
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/about', label: t('nav.about') },
                { to: '/services', label: t('nav.services') },
                { to: '/appointment', label: t('nav.appointment') },
                { to: '/testimonials', label: t('nav.testimonials') },
                { to: '/contact', label: t('nav.contact') },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/60 hover:text-sage-light transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.contactInfo')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sage-light mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/60 leading-relaxed">
                  {t('location.address')}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sage-light flex-shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="text-sm text-white/60 hover:text-sage-light transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sage-light flex-shrink-0" />
                <a
                  href="mailto:dr.kajalpatil@clinic.com"
                  className="text-sm text-white/60 hover:text-sage-light transition-colors"
                >
                  dr.kajalpatil@clinic.com
                </a>
              </li>
            </ul>
          </div>

          {/* Clinic Hours */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.clinicHours')}
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-sage-light mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white/80">{t('footer.monSat')}</p>
                  <p className="text-sm text-white/50">{t('footer.monSatHours')}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 ml-6">
                <div>
                  <p className="text-sm font-medium text-white/80">{t('footer.sunday')}</p>
                  <p className="text-sm text-white/50">{t('footer.sunHours')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 text-center sm:text-left">
            © {new Date().getFullYear()} Dr. Kajal Patil. {t('footer.rights')}
          </p>
          <p className="text-xs text-white/30 text-center sm:text-right max-w-md">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-sage/20 hover:bg-sage/40 flex items-center justify-center transition-all duration-300 group"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-4 h-4 text-sage-light group-hover:text-white transition-colors" />
      </button>
    </footer>
  );
}
