import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function FAQ() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.05);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { q: t('faqSection.q1'), a: t('faqSection.a1') },
    { q: t('faqSection.q2'), a: t('faqSection.a2') },
    { q: t('faqSection.q3'), a: t('faqSection.a3') },
    { q: t('faqSection.q4'), a: t('faqSection.a4') },
    { q: t('faqSection.q5'), a: t('faqSection.a5') },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>FAQ - Dr. Kajal Patil | General Physician Surat</title>
        <meta name="description" content="Find answers to frequently asked questions about Dr. Kajal Patil's practice, appointment booking, and healthcare services in Surat." />
      </Helmet>

      <main className="pt-20">
        <section className="section-padding bg-gradient-to-br from-mint-light/30 via-offwhite to-beige/20 relative overflow-hidden min-h-screen">
          <div className="organic-shape organic-shape-1 -top-20 -right-32" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div ref={ref} className={`text-center mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark mb-4">
                {t('faqPage.title')}
              </h1>
              <p className="text-warm-gray text-lg max-w-2xl mx-auto mb-8">
                {t('faqPage.subtitle')}
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="input-field !pl-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-lg shadow-soft border border-mint/15 overflow-hidden transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${200 + i * 100}ms` }}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-mint/5 transition-colors"
                  >
                    <span className="text-base font-semibold text-dark">{faq.q}</span>
                    {openIndex === i ? (
                      <ChevronUp className="w-5 h-5 text-sage flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-warm-gray flex-shrink-0" />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openIndex === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-6 pb-5 text-sm text-warm-gray leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}

              {filteredFaqs.length === 0 && (
                <div className="text-center py-12 text-warm-gray">
                  <p className="text-lg">No matching questions found.</p>
                  <p className="text-sm mt-2">Try a different search term.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
