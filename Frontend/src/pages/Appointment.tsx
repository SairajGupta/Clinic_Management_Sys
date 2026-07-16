import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

const DateInput = ({ value, onChange, placeholder, required = false, min, max }: { value: string, onChange: (val: string) => void, placeholder: string, required?: boolean, min?: string, max?: string }) => {
  const [displayValue, setDisplayValue] = useState(formatDateToDDMMYYYY(value));
  const dateRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setDisplayValue(formatDateToDDMMYYYY(value));
  }, [value]);

  const handleContainerClick = () => {
    if (dateRef.current && typeof dateRef.current.showPicker === 'function') {
      try {
        dateRef.current.showPicker();
      } catch (e) {
        // ignore
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); 
    if (input.length > 8) input = input.slice(0, 8);
    
    let formatted = input;
    if (input.length > 4) {
      formatted = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4)}`;
    } else if (input.length > 2) {
      formatted = `${input.slice(0, 2)}/${input.slice(2)}`;
    }
    
    setDisplayValue(formatted);
    
    if (input.length === 8) {
      onChange(parseDDMMYYYYtoYYYYMMDD(formatted));
    } else {
      onChange('');
    }
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yyyymmdd = e.target.value;
    if (yyyymmdd) {
      onChange(yyyymmdd);
      setDisplayValue(formatDateToDDMMYYYY(yyyymmdd));
    }
  };

  return (
    <div className="relative" onClick={handleContainerClick}>
      <input 
        type="text" 
        className="input-field font-mono pr-10" 
        placeholder={placeholder} 
        value={displayValue} 
        onChange={handleChange} 
        required={required}
      />
      <input 
        type="date"
        ref={dateRef}
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 cursor-pointer w-8 h-8 z-10"
        value={value}
        onChange={handleDatePick}
        min={min}
        max={max}
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage pointer-events-none" />
    </div>
  );
};

export default function Appointment() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.05);
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const [step, setStep] = useState(1);
  const [patientType, setPatientType] = useState<'new' | 'existing' | null>(null);
  const [phoneQuery, setPhoneQuery] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showNoRecordsPopup, setShowNoRecordsPopup] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [tokenNumber, setTokenNumber] = useState<number | null>(null);

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
    
    // DEMO MODE for public users - skip DB lookup
    if (role !== 'RECEPTIONIST' && role !== 'ADMIN') {
      setTimeout(() => {
        setSearching(false);
        if (patientType === 'existing') {
          setShowNoRecordsPopup(true);
        } else {
          updateField('phone', phoneQuery);
          setStep(4);
        }
      }, 800);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/patients/by-phone?phone=${phoneQuery}`);
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

    // DEMO MODE for public users - skip DB save
    if (role !== 'RECEPTIONIST' && role !== 'ADMIN') {
      setTimeout(() => {
        setAppointmentId(`DEMO-${Math.floor(1000 + Math.random() * 9000)}`);
        // Only assign a token if the appointment is for today
        const isToday = form.preferred_date === new Date().toISOString().split('T')[0];
        setTokenNumber(isToday ? Math.floor(1 + Math.random() * 20) : null);
        setSubmitted(true);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const payload = { 
        ...form, 
        dob: formatDateToDDMMYYYY(form.dob),
        preferred_date: formatDateToDDMMYYYY(form.preferred_date)
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setAppointmentId(data.appointment_id);
        if (data.token_number) {
          setTokenNumber(data.token_number);
        }
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
    setTokenNumber(null);
    setError('');
    setStep(1);
    setPatientType(null);
    setPhoneQuery('');
    setProfiles([]);
    setShowNoRecordsPopup(false);
    setForm({
      name: '', dob: '', gender: '', phone: '', email: '',
      preferred_date: '', preferred_time: '', reason: '', language_preference: 'English',
    });
  };

  const getAvailableTimeSlots = () => {
    const allSlots = [
      t('appointment.morning1'),
      t('appointment.morning2'),
      t('appointment.morning3'),
      t('appointment.morning4'),
      t('appointment.evening1'),
      t('appointment.evening2'),
      t('appointment.evening3'),
    ];

    if (!form.preferred_date) return allSlots;

    const today = new Date().toISOString().split('T')[0];
    if (form.preferred_date !== today) return allSlots;

    const now = new Date();
    const currentHours = now.getHours();

    return allSlots.filter(slot => {
      const startTimeStr = slot.split(" - ")[0];
      const timeParts = startTimeStr.split(" ");
      if (timeParts.length !== 2) return true;

      const [time, modifier] = timeParts;
      let [hours] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      if (hours < currentHours) return false;
      
      return true;
    });
  };

  const timeSlots = getAvailableTimeSlots();

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
                  {role !== 'RECEPTIONIST' && role !== 'ADMIN' ? 'Demo Booking Successful!' : t('appointment.successTitle')}
                </h2>
                <p className="text-warm-gray mb-2">
                  {role !== 'RECEPTIONIST' && role !== 'ADMIN' 
                    ? 'This was a simulated booking for demonstration purposes. No real data was saved.' 
                    : t('appointment.successMessage')}
                </p>
                <p className="text-sm font-mono bg-mint/30 text-sage-dark px-4 py-2 rounded-3xl inline-block mb-4">
                  ID: {appointmentId}
                </p>
                {tokenNumber && (
                  <div className="mb-8 p-4 bg-sky-50 border border-sky-200 rounded-3xl animate-fade-in shadow-sm">
                    <p className="text-sky-800 font-medium mb-1">Your Queue Token</p>
                    <p className="text-5xl font-extrabold text-sky-600">#{tokenNumber}</p>
                    <p className="text-sm text-sky-700 mt-2">Please present this number at the front desk</p>
                  </div>
                )}
                {!tokenNumber && (
                  <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-3xl animate-fade-in shadow-sm">
                    <p className="text-amber-800 font-bold mb-2">Queue Token Update</p>
                    <p className="text-sm text-amber-700 mb-2">Your token will be automatically generated <strong>30 minutes prior</strong> to your appointment.</p>
                    <p className="text-xs text-amber-600">For generating a token instantly, please walk-in and consult the receptionist.</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={resetFlow} className="btn-primary">
                    <RefreshCw className="w-4 h-4" />
                    {t('appointment.bookAnother')}
                  </button>
                  {(role === 'RECEPTIONIST' || role === 'ADMIN') ? (
                    <button 
                      onClick={() => navigate('/receptionist')} 
                      className="px-6 py-3 rounded-full font-bold text-sage-dark border-2 border-mint bg-white hover:bg-mint-light transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Dashboard
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate('/')} 
                      className="px-6 py-3 rounded-full font-bold text-sage-dark border-2 border-mint bg-white hover:bg-mint-light transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Home
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Booking Flow */
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-mint/20">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-3xl border border-red-100 text-sm font-medium">
                    {error}
                  </div>
                )}
                
                {step === 1 && (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-center mb-8">Are you a new or existing patient?</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <button 
                        onClick={() => { setPatientType('existing'); setStep(2); }}
                        className="flex flex-col items-center p-8 rounded-3xl border-2 border-mint-light hover:border-sage bg-mint-light/10 hover:bg-mint/20 transition-all group"
                      >
                        <Users className="w-12 h-12 text-sage mb-4 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-bold text-dark">Existing Patient</span>
                        <span className="text-sm text-warm-gray mt-2 text-center">I have visited before</span>
                      </button>
                      <button 
                        onClick={() => { setPatientType('new'); setStep(2); }}
                        className="flex flex-col items-center p-8 rounded-3xl border-2 border-beige hover:border-gold/50 bg-beige/10 hover:bg-beige/30 transition-all group"
                      >
                        <UserPlus className="w-12 h-12 text-gold mb-4 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-bold text-dark">New Patient</span>
                        <span className="text-sm text-warm-gray mt-2 text-center">This is my first time</span>
                      </button>
                    </div>
                    
                    <div className="mt-10 flex justify-center border-t border-gray-100 pt-6">
                      <button 
                        onClick={() => navigate((role === 'RECEPTIONIST' || role === 'ADMIN') ? '/receptionist' : '/')}
                        className="flex items-center text-sage font-medium hover:text-sage-dark transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {(role === 'RECEPTIONIST' || role === 'ADMIN') ? 'Back to Dashboard' : 'Back to Home'}
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
                              className="flex-1 py-2.5 px-4 rounded-3xl border border-gray-200 text-dark font-semibold hover:bg-gray-50 transition-colors"
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
                              className="flex-1 py-2.5 px-4 rounded-3xl bg-sage text-white font-semibold hover:bg-sage-dark shadow-button hover:shadow-button-hover transition-all"
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
                          className="flex items-center justify-between p-4 rounded-3xl border border-mint cursor-pointer hover:bg-mint-light/20 hover:shadow-md transition-all"
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
                        className="flex items-center justify-center p-4 rounded-3xl border-2 border-dashed border-mint cursor-pointer hover:bg-mint-light/20 transition-all text-sage font-semibold"
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
                          <label className="block text-sm font-semibold text-dark mb-1.5">{t('appointment.dob', 'Date of Birth')}</label>
                          <DateInput
                            value={form.dob}
                            onChange={(val) => updateField('dob', val)}
                            placeholder="DD/MM/YYYY"
                            required={true}
                            max={new Date().toISOString().split('T')[0]}
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
                          <DateInput
                            value={form.preferred_date}
                            onChange={(val) => updateField('preferred_date', val)}
                            placeholder="DD/MM/YYYY"
                            required={true}
                            min={new Date().toISOString().split('T')[0]}
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

