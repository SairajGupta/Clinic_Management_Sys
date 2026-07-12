import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Calendar,
  Globe,
  ChevronDown,
} from 'lucide-react';

const navLinks = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/about', labelKey: 'nav.about' },
  { to: '/services', labelKey: 'nav.services' },
  { to: '/testimonials', labelKey: 'nav.testimonials' },
  { to: '/faq', labelKey: 'nav.faq' },
  { to: '/gallery', labelKey: 'nav.gallery' },
  { to: '/contact', labelKey: 'nav.contact' },
  { to: '/prescription', labelKey: 'nav.prescription' },
];

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const switchLanguage = useCallback(
    (code: string) => {
      i18n.changeLanguage(code);
      setLangOpen(false);
    },
    [i18n]
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass transition-all duration-300">
      <nav className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMobileOpen(false)}
          >
            <img src="/Home/doctor-logo-49376.png" alt="Doctor Logo" className="w-10 h-10 object-contain" />
            <div className="hidden sm:block">
              <span className="block text-base font-bold font-[family-name:var(--font-heading)] text-dark leading-tight">
                Dr. Kajal Patil
              </span>
              <span className="block text-[11px] font-medium text-sage-dark tracking-wide whitespace-nowrap">
                BHMS • General Physician
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-3xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-sage-dark bg-mint/50'
                      : 'text-dark-soft hover:text-sage-dark hover:bg-mint/30'
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-3xl text-sm font-medium text-dark-soft hover:bg-mint/30 transition-all duration-200 whitespace-nowrap flex-nowrap"
                aria-label="Select language"
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{currentLang.flag} {currentLang.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-44 bg-white rounded-lg shadow-elevated border border-mint/50 overflow-hidden z-50 animate-scale-in">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-150 flex items-center gap-2.5 ${
                          i18n.language === lang.code
                            ? 'bg-mint/50 text-sage-dark'
                            : 'text-dark-soft hover:bg-mint/20'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* CTA Button (Desktop) */}
            <Link
              to="/appointment"
              className="hidden lg:inline-flex btn-primary text-sm !py-2 !px-5 whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              {t('nav.bookNow')}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-3xl hover:bg-mint/30 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-dark" />
              ) : (
                <Menu className="w-5 h-5 text-dark" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 ease-out overflow-hidden ${
          mobileOpen ? 'max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-5 pt-2 bg-white/95 backdrop-blur-md border-t border-mint/30 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-3xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-sage-dark bg-mint/40'
                      : 'text-dark-soft hover:text-sage-dark hover:bg-mint/20'
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-mint/30">
            <Link
              to="/appointment"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full justify-center text-sm whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              {t('nav.bookNow')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
