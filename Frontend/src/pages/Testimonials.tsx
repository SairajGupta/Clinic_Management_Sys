import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Star, Quote } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Testimonials() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.05);

  const reviews = [
    { nameKey: 't1Name', textKey: 't1', condKey: 't1Condition', rating: 5 },
    { nameKey: 't2Name', textKey: 't2', condKey: 't2Condition', rating: 5 },
    { nameKey: 't3Name', textKey: 't3', condKey: 't3Condition', rating: 5 },
    { nameKey: 't4Name', textKey: 't4', condKey: 't4Condition', rating: 5 },
    { nameKey: 't5Name', textKey: 't5', condKey: 't5Condition', rating: 4.5 },
    { nameKey: 't6Name', textKey: 't6', condKey: 't6Condition', rating: 5 },
  ];

  return (
    <>
      <Helmet>
        <title>Patient Testimonials - Dr. Kajal Patil | Surat</title>
        <meta name="description" content="Read real patient testimonials and reviews about Dr. Kajal Patil's compassionate healthcare services in Surat." />
      </Helmet>

      <main className="pt-20">
        <section className="section-padding bg-gradient-to-br from-mint-light/30 via-offwhite to-beige/20 relative overflow-hidden">
          <div className="organic-shape organic-shape-1 -top-20 -right-32" />
          <div className="organic-shape organic-shape-2 bottom-20 -left-20" />

          <div className="relative z-10 max-w-6xl mx-auto">
            <div ref={ref} className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark mb-4">
                {t('testimonialsPage.title')}
              </h1>
              <p className="text-warm-gray text-lg max-w-2xl mx-auto">
                {t('testimonialsPage.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-2xl p-6 shadow-soft hover-lift border border-mint/15 relative transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${200 + i * 100}ms` }}
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-mint opacity-40" />

                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: Math.floor(review.rating) }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                    {review.rating % 1 !== 0 && (
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400/50" />
                    )}
                  </div>

                  <p className="text-sm text-dark-soft leading-relaxed mb-6 italic">
                    "{t(`testimonialsPage.${review.textKey}`)}"
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-mint/20">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sage-light to-mint flex items-center justify-center text-sage-dark font-bold text-sm shadow-sm">
                      {t(`testimonialsPage.${review.nameKey}`).charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark">
                        {t(`testimonialsPage.${review.nameKey}`)}
                      </p>
                      <p className="text-xs text-warm-gray">
                        {t(`testimonialsPage.${review.condKey}`)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
