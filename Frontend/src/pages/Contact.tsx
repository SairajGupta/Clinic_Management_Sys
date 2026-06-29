import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Contact() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.05);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <>
      <Helmet>
        <title>Contact - Dr. Kajal Patil | General Physician Surat</title>
        <meta name="description" content="Contact Dr. Kajal Patil's clinic in Surat. Find address, phone, email, clinic hours, and directions to Healing Harmony Clinic near City Light Road." />
      </Helmet>

      <main className="pt-20">
        <section className="section-padding bg-gradient-to-br from-mint-light/30 via-offwhite to-beige/20 relative overflow-hidden">
          <div className="organic-shape organic-shape-1 -top-20 -right-32" />

          <div className="relative z-10 max-w-6xl mx-auto">
            <div ref={ref} className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark mb-4">
                {t('contact.title')}
              </h1>
              <p className="text-warm-gray text-lg max-w-2xl mx-auto">
                {t('contact.subtitle')}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* Contact Info */}
              <div className={`space-y-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                <h3 className="text-xl font-bold text-dark mb-6">{t('contact.getInTouch')}</h3>

                <div className="bg-white rounded-2xl p-5 shadow-soft border border-mint/15 flex items-start gap-4 hover-lift">
                  <div className="w-11 h-11 rounded-xl bg-sage/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-sage-dark" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dark mb-1">Address</h4>
                    <p className="text-sm text-warm-gray leading-relaxed">
                      {t('location.address')}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-soft border border-mint/15 flex items-start gap-4 hover-lift">
                  <div className="w-11 h-11 rounded-xl bg-sky/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-sky-dark" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dark mb-1">Phone</h4>
                    <a href="tel:+919876543210" className="text-sm text-warm-gray hover:text-sage-dark transition-colors">
                      +91 98765 43210
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
                      dr.kajalpatil@clinic.com
                    </a>
                  </div>
                </div>

                {/* Clinic Hours Table */}
                <div className="bg-white rounded-2xl p-5 shadow-soft border border-mint/15">
                  <div className="flex items-center gap-2.5 mb-4">
                    <Clock className="w-5 h-5 text-sage-dark" />
                    <h4 className="text-sm font-bold text-dark">{t('contact.clinicHours')}</h4>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-mint/20">
                        <th className="text-left py-2 text-dark font-semibold">{t('contact.day')}</th>
                        <th className="text-right py-2 text-dark font-semibold">{t('contact.hours')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-warm-gray">
                      <tr className="border-b border-mint/10">
                        <td className="py-2.5">{t('contact.monFri')}</td>
                        <td className="py-2.5 text-right">{t('contact.monFriHours')}</td>
                      </tr>
                      <tr className="border-b border-mint/10">
                        <td className="py-2.5">{t('contact.saturday')}</td>
                        <td className="py-2.5 text-right">{t('contact.satHours')}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5">{t('contact.sunday')}</td>
                        <td className="py-2.5 text-right">{t('contact.sunHours')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Emergency Note */}
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200/50 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {t('contact.emergencyNote')}
                  </p>
                </div>
              </div>

              {/* Right: Contact Form + Map */}
              <div className={`space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
                {/* Contact Form */}
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-mint/15">
                  <h3 className="text-lg font-bold text-dark mb-5">{t('contact.sendMessage')}</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input type="text" className="input-field" placeholder={t('contact.name')} required />
                    </div>
                    <div>
                      <input type="email" className="input-field" placeholder={t('contact.email')} required />
                    </div>
                    <div>
                      <input type="text" className="input-field" placeholder={t('contact.subject')} required />
                    </div>
                    <div>
                      <textarea className="input-field resize-none" rows={4} placeholder={t('contact.message')} required />
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center">
                      <Send className="w-4 h-4" />
                      {sent ? '✓ Sent!' : t('contact.send')}
                    </button>
                  </form>
                </div>

                {/* Map */}
                <div className="rounded-2xl overflow-hidden shadow-soft border border-mint/15 h-64">
                  <iframe
                    title="Clinic Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.288!2d72.7929!3d21.1702!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDEwJzEyLjciTiA3MsKwNDcnMzQuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
