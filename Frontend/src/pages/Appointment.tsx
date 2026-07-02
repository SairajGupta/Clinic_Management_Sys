import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  CheckCircle,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  Globe,
  RefreshCw,
  Search,
  Users,
  UserPlus,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface FormData {
  name: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  preferred_date: string;
  preferred_time: string;
  reason: string;
  language_preference: string;
}

const formatDateToDDMMYYYY = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const parseDDMMYYYYtoYYYYMMDD = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.split('/');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const calculateAgeFromDDMMYYYY = (dobString: string) => {
  if (!dobString) return '';
  const parts = dobString.split('/');
  if (parts.length !== 3) return '';
  const dob = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  const ageDifMs = Date.now() - dob.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export default function Appointment() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.05);
  
  const [step, setStep] = useState(1);
  const [patientType, setPatientType] = useState<'new' | 'existing' | null>(null);
  const [phoneQuery, setPhoneQuery] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [showNoRecordsPopup, setShowNoRecordsPopup] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentId, setAppointmentId] = useState('');

  const [form, setForm] = useState<FormData>({
    name: '',
    dob: '', // Stored internally as YYYY-MM-DD for the native date picker
    gender: '',
    phone: '',
    email: '',
    preferred_date: '', // Stored internally as YYYY-MM-DD for the native date picker
    preferred_time: '',
    reason: '',
    language_preference: 'English',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!phoneQuery) return;
    
    setSearching(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8000/api/patients/by-phone?phone=${phoneQuery}`);
      if (response.ok) {
        const data = await response.json();
        if (data.patients && data.patients.length > 0) {
          setProfiles(data.patients);
          setStep(3); // Profile selection
        } else {
          if (patientType === 'existing') {
            setShowNoRecordsPopup(true);
          } else {
            // No profiles found, proceed to form
            updateField('phone', phoneQuery);
            setStep(4);
          }
        }
      } else {
        // Fallback to form
        if (patientType === 'existing') {
          setShowNoRecordsPopup(true);
        } else {
          updateField('phone', phoneQuery);
          setStep(4);
        }
      }
    } catch (err) {
      setError('Network error checking phone number.');
      updateField('phone', phoneQuery);
      setStep(4);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectProfile = (profile: any) => {
    setSelectedProfileId(profile.id);
    setForm((prev) => ({
      ...prev,
      name: `${profile.first_name} ${profile.last_name || ''}`.trim(),
      dob: parseDDMMYYYYtoYYYYMMDD(profile.dob || ''),
      gender: profile.gender || '',
      email: profile.email || '',
      phone: phoneQuery,
    }));
    setStep(4);
  };

  const handleAddNewPatient = () => {
    setSelectedProfileId(null);
    setForm((prev) => ({
      ...prev,
      name: '',
      dob: '',
      gender: '',
      email: '',
      phone: phoneQuery,
    }));
    setStep(4);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { 
        ...form, 
        dob: formatDateToDDMMYYYY(form.dob),
        preferred_date: formatDateToDDMMYYYY(form.preferred_date)
      };

      const response = await fetch('http://localhost:8000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setAppointmentId(data.appointment_id);
        setSubmitted(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || 'Failed to book appointment. Please try again.');
      }
    } catch {
      setError('Network error. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setSubmitted(false);
    setAppointmentId('');
    setError('');
    setStep(1);
    setPatientType(null);
    setPhoneQuery('');
    setProfiles([]);
    setSelectedProfileId(null);
    setShowNoRecordsPopup(false);
    setForm({
      name: '', dob: '', gender: '', phone: '', email: '',
      preferred_date: '', preferred_time: '', reason: '', language_preference: 'English',
    });
  };

  const timeSlots = [
    t('appointment.morning1'),
    t('appointment.morning2'),
    t('appointment.morning3'),
    t('appointment.morning4'),
    t('appointment.evening1'),
    t('appointment.evening2'),
    t('appointment.evening3'),
  ];

  return (
    <>
      <Helmet>
        <title>Book Appointment - Dr. Kajal Patil | Surat</title>
        <meta name="description" content="Book your appointment with Dr. Kajal Patil, BHMS General Physician in Surat. Easy online booking with same-day consultation available." />
      </Helmet>

      <main className="pt-20">
        <section className="section-padding bg-gradient-to-br from-mint-light/30 via-offwhite to-beige/20 relative overflow-hidden min-h-screen">
          <div className="organic-shape organic-shape-1 -top-20 -right-32" />
          <div className="organic-shape organic-shape-3 bottom-20 -left-20" />

          <div ref={ref} className={`relative z-10 max-w-3xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-dark mb-3">
                {t('appointment.title')}
              </h1>
              <p className="text-warm-gray text-lg">{t('appointment.subtitle')}</p>
            </div>

            {submitted ? (
              /* Success State */
              <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-card border border-mint/20 text-center animate-scale-in">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sage to-sage-dark mx-auto flex items-center justify-center mb-6 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-dark mb-3">
                  {t('appointment.successTitle')}
                </h2>
                <p className="text-warm-gray mb-2">{t('appointment.successMessage')}</p>
                <p className="text-sm font-mono bg-mint/30 text-sage-dark px-4 py-2 rounded-xl inline-block mb-8">
                  ID: {appointmentId}
                </p>
                <div>
                  <button onClick={resetFlow} className="btn-primary">
                    <RefreshCw className="w-4 h-4" />
                    {t('appointment.bookAnother')}
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Flow */
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-mint/20">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                    {error}
                  </div>
                )}
                
                {step === 1 && (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-center mb-8">Are you a new or existing patient?</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <button 
                        onClick={() => { setPatientType('existing'); setStep(2); }}
                        className="flex flex-col items-center p-8 rounded-2xl border-2 border-mint-light hover:border-sage bg-mint-light/10 hover:bg-mint/20 transition-all group"
                      >
                        <Users className="w-12 h-12 text-sage mb-4 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-bold text-dark">Existing Patient</span>
                        <span className="text-sm text-warm-gray mt-2 text-center">I have visited before</span>
                      </button>
                      <button 
                        onClick={() => { setPatientType('new'); setStep(2); }}
                        className="flex flex-col items-center p-8 rounded-2xl border-2 border-beige hover:border-gold/50 bg-beige/10 hover:bg-beige/30 transition-all group"
                      >
                        <UserPlus className="w-12 h-12 text-gold mb-4 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-bold text-dark">New Patient</span>
                        <span className="text-sm text-warm-gray mt-2 text-center">This is my first time</span>
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-fade-in">
                    <button onClick={() => setStep(1)} className="flex items-center text-sage font-medium mb-6 hover:text-sage-dark transition-colors">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </button>
                    <h3 className="text-xl font-bold text-center mb-2">Enter your Phone Number</h3>
                    <p className="text-center text-warm-gray mb-8">We use this to find your records.</p>
                    <form onSubmit={handlePhoneSearch} className="max-w-md mx-auto">
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-dark mb-1.5">
                          <Phone className="w-4 h-4 inline mr-1.5 text-sage" />
                          {t('appointment.phone')}
                        </label>
                        <input
                          type="tel"
                          className="input-field text-lg py-3"
                          value={phoneQuery}
                          onChange={(e) => setPhoneQuery(e.target.value)}
                          placeholder="e.g. 9876543210"
                          required
                          autoFocus
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn-primary w-full justify-center text-base py-3.5"
                        disabled={searching || !phoneQuery}
                      >
                        {searching ? (
                          <><RefreshCw className="w-5 h-5 animate-spin" /> Searching...</>
                        ) : (
                          <>Continue <ArrowRight className="w-5 h-5 ml-1" /></>
                        )}
                      </button>
                    </form>

                    {/* No Records Popup */}
                    {showNoRecordsPopup && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 backdrop-blur-sm animate-fade-in p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-scale-in text-center border border-mint/20">
                          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500">
                            <Search className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold text-dark mb-2">No Records Found</h3>
                          <p className="text-warm-gray mb-6">We couldn't find any existing patient records for {phoneQuery}. Do you want to proceed as a new patient?</p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowNoRecordsPopup(false)}
                              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-dark font-semibold hover:bg-gray-50 transition-colors"
                            >
                              No, try again
                            </button>
                            <button
                              onClick={() => {
                                setShowNoRecordsPopup(false);
                                setPatientType('new');
                                updateField('phone', phoneQuery);
                                setStep(4);
                              }}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-sage text-white font-semibold hover:bg-sage-dark shadow-button hover:shadow-button-hover transition-all"
                            >
                              Yes, proceed
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-fade-in">
                    <button onClick={() => setStep(2)} className="flex items-center text-sage font-medium mb-6 hover:text-sage-dark transition-colors">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </button>
                    <h3 className="text-xl font-bold text-center mb-2">Select a Patient Profile</h3>
                    <p className="text-center text-warm-gray mb-8">Profiles found for {phoneQuery}</p>
                    
                    <div className="grid gap-4 max-w-2xl mx-auto">
                      {profiles.map((p) => (
                        <div 
                          key={p.id} 
                          onClick={() => handleSelectProfile(p)}
                          className="flex items-center justify-between p-4 rounded-xl border border-mint cursor-pointer hover:bg-mint-light/20 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-mint/40 flex items-center justify-center text-sage font-bold text-lg mr-4">
                              {p.first_name[0]}{p.last_name?.[0] || ''}
                            </div>
                            <div>
                              <h4 className="font-bold text-dark">{p.first_name} {p.last_name}</h4>
                              <p className="text-sm text-warm-gray">{p.gender}, {calculateAgeFromDDMMYYYY(p.dob)} years</p>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-sage opacity-50" />
                        </div>
                      ))}
                      
                      <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                        <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-gray-500">OR</span></div>
                      </div>

                      <div 
                        onClick={handleAddNewPatient}
                        className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-mint cursor-pointer hover:bg-mint-light/20 transition-all text-sage font-semibold"
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Add New Patient
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                      <button onClick={() => profiles.length > 0 ? setStep(3) : setStep(2)} className="flex items-center text-sage font-medium hover:text-sage-dark transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* Name */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-dark mb-1.5">
                            <User className="w-4 h-4 inline mr-1.5 text-sage" />
                            {t('appointment.name')}
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={form.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            required
                          />
                        </div>

                        {/* DOB */}
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-1.5">{t('appointment.dob', 'Date of Birth (DD/MM/YYYY)')}</label>
                          <input
                            type="date"
                            className="input-field"
                            value={form.dob}
                            onChange={(e) => updateField('dob', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-1.5">{t('appointment.gender')}</label>
                          <select
                            className="input-field"
                            value={form.gender}
                            onChange={(e) => updateField('gender', e.target.value)}
                            required
                          >
                            <option value="">{t('appointment.genderSelect')}</option>
                            <option value="Male">{t('appointment.male')}</option>
                            <option value="Female">{t('appointment.female')}</option>
                            <option value="Other">{t('appointment.other')}</option>
                          </select>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-1.5">
                            <Phone className="w-4 h-4 inline mr-1.5 text-sage" />
                            {t('appointment.phone')}
                          </label>
                          <input
                            type="tel"
                            className="input-field bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                            value={form.phone}
                            readOnly
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-1.5">
                            <Mail className="w-4 h-4 inline mr-1.5 text-sage" />
                            {t('appointment.email')}
                          </label>
                          <input
                            type="email"
                            className="input-field"
                            value={form.email}
                            onChange={(e) => updateField('email', e.target.value)}
                          />
                        </div>

                        {/* Date */}
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-1.5">
                            <Calendar className="w-4 h-4 inline mr-1.5 text-sage" />
                            {t('appointment.date')}
                          </label>
                          <input
                            type="date"
                            className="input-field"
                            value={form.preferred_date}
                            onChange={(e) => updateField('preferred_date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>

                        {/* Time */}
                        <div>
                          <label className="block text-sm font-semibold text-dark mb-1.5">
                            <Clock className="w-4 h-4 inline mr-1.5 text-sage" />
                            {t('appointment.time')}
                          </label>
                          <select
                            className="input-field"
                            value={form.preferred_time}
                            onChange={(e) => updateField('preferred_time', e.target.value)}
                            required
                          >
                            <option value="">{t('appointment.timeSelect')}</option>
                            {timeSlots.map((slot) => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>

                        {/* Reason */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-dark mb-1.5">
                            <MessageSquare className="w-4 h-4 inline mr-1.5 text-sage" />
                            {t('appointment.reason')}
                          </label>
                          <textarea
                            className="input-field resize-none"
                            rows={3}
                            value={form.reason}
                            onChange={(e) => updateField('reason', e.target.value)}
                            placeholder={t('appointment.reasonPlaceholder')}
                            required
                          />
                        </div>

                        {/* Language Preference */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-dark mb-1.5">
                            <Globe className="w-4 h-4 inline mr-1.5 text-sage" />
                            {t('appointment.language')}
                          </label>
                          <select
                            className="input-field"
                            value={form.language_preference}
                            onChange={(e) => updateField('language_preference', e.target.value)}
                          >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Gujarati">Gujarati</option>
                            <option value="Marathi">Marathi</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary w-full justify-center mt-8 text-base py-3.5"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            {t('appointment.submitting')}
                          </>
                        ) : (
                          <>
                            <Calendar className="w-5 h-5" />
                            {t('appointment.submit')}
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

