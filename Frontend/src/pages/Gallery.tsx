import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { X, ZoomIn } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const galleryItems = [
  {
    id: 1,
    title: 'Reception Area',
    category: 'Clinic Interior',
    gradient: 'from-mint via-mint-light to-sage-light/30',
    icon: '🏥',
  },
  {
    id: 2,
    title: 'Consultation Room',
    category: 'Consultation',
    gradient: 'from-beige via-beige-dark/20 to-mint-light/30',
    icon: '🩺',
  },
  {
    id: 3,
    title: 'Waiting Area',
    category: 'Clinic Interior',
    gradient: 'from-sky-light/30 via-mint-light to-offwhite',
    icon: '🪴',
  },
  {
    id: 4,
    title: 'Medicine Storage',
    category: 'Clinic Interior',
    gradient: 'from-sage-light/20 via-mint to-mint-light',
    icon: '💊',
  },
  {
    id: 5,
    title: 'Health Education Corner',
    category: 'Wellness',
    gradient: 'from-beige to-beige-dark/30',
    icon: '📚',
  },
  {
    id: 6,
    title: 'Clinic Entrance',
    category: 'Clinic Interior',
    gradient: 'from-mint-light via-sage-light/20 to-sky-light/20',
    icon: '🌿',
  },
];

export default function Gallery() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.05);
  const [selectedImage, setSelectedImage] = useState<typeof galleryItems[0] | null>(null);

  return (
    <>
      <Helmet>
        <title>Gallery - Dr. Kajal Patil's Clinic | Surat</title>
        <meta name="description" content="Take a virtual tour of Dr. Kajal Patil's warm and welcoming clinic in Surat. View our consultation rooms, waiting area, and healing spaces." />
      </Helmet>

      <main className="pt-20">
        <section className="section-padding bg-gradient-to-br from-mint-light/30 via-offwhite to-beige/20 relative overflow-hidden min-h-screen">
          <div className="organic-shape organic-shape-1 -top-20 -right-32" />
          <div className="organic-shape organic-shape-3 bottom-20 -left-20" />

          <div className="relative z-10 max-w-6xl mx-auto">
            <div ref={ref} className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark mb-4">
                {t('gallery.title')}
              </h1>
              <p className="text-warm-gray text-lg max-w-2xl mx-auto">
                {t('gallery.subtitle')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item)}
                  className={`group cursor-pointer rounded-2xl overflow-hidden shadow-soft hover-lift border border-mint/15 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${200 + i * 100}ms` }}
                >
                  <div className={`relative h-56 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                    <span className="text-6xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-300">
                      {item.icon}
                    </span>
                    <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/10 transition-colors duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  <div className="bg-white p-4">
                    <h3 className="text-sm font-bold text-dark">{item.title}</h3>
                    <p className="text-xs text-warm-gray mt-0.5">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[60] bg-dark/80 backdrop-blur-sm flex items-center justify-center p-4 animate-scale-in"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative bg-white rounded-3xl overflow-hidden shadow-elevated max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-80 sm:h-96 bg-gradient-to-br ${selectedImage.gradient} flex items-center justify-center`}>
                <span className="text-8xl opacity-50">{selectedImage.icon}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-dark">{selectedImage.title}</h3>
                <p className="text-sm text-warm-gray mt-1">{selectedImage.category}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-dark" />
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
