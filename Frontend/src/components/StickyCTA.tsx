import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function StickyCTA() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-all duration-300 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-mint/30 px-4 py-3 shadow-elevated">
        <Link
          to="/appointment"
          className="btn-primary w-full justify-center text-sm"
        >
          <Calendar className="w-4 h-4" />
          {t('nav.bookNow')}
        </Link>
      </div>
    </div>
  );
}
