import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Helmet } from 'react-helmet-async';
import UpdatePasswordModal from '../components/UpdatePasswordModal';

interface QueueItem {
  token_id: number;
  token_number: number;
  sort_order: number;
  status: string;
  patient_name: string;
  appointment_time: string;
  patient_id: number;
  appointment_id: number;
  completed_at?: string;
}

interface MedicationForm {
  medicine_name: string;
  dosage: string;
  duration: string;
}

interface Appointment {
  id: number;
  appointment_id: string;
  date: string;
  time: string;
  status: string;
  reason: string;
}

interface Prescription {
  id: number;
  prescription_id: string;
  date: string;
  doctor: string;
  medications_count: number;
}

interface PatientHistoryData {
  appointments: Appointment[];
  prescriptions: Prescription[];
}

interface DoctorDashboardProps {
  isDemo?: boolean;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ isDemo = false }) => {
  const { name, role, token, logout } = useAuth();
  const { showToast } = useToast();
  
  const displayName = isDemo ? 'Demo Doctor' : (name || role);
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<QueueItem | null>(null);

  const displayQueue = React.useMemo(() => {
    const serving = queue.filter(q => q.status === 'SERVING');
    const checkedIn = queue.filter(q => q.status === 'CHECKED_IN');
    
    const completed = queue.filter(q => q.status === 'COMPLETED').sort((a, b) => {
      if (a.completed_at && b.completed_at) {
        return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
      }
      return b.sort_order - a.sort_order;
    });
    
    const topCompleted = completed.slice(0, 2).reverse();
    const remainingCompleted = completed.slice(2);
    
    return [...topCompleted, ...serving, ...checkedIn, ...remainingCompleted];
  }, [queue]);

  // Prescription Form State
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState<MedicationForm[]>([{ medicine_name: '', dosage: '', duration: '' }]);
  const [submitting, setSubmitting] = useState(false);
  
  // Patient History State
  const [activeTab, setActiveTab] = useState<'prescription' | 'history'>('prescription');
  const [patientHistory, setPatientHistory] = useState<PatientHistoryData | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);

  const fetchQueue = async () => {
    if (isDemo) {
      setQueue([
        { token_id: 1, token_number: 12, sort_order: 1, status: 'SERVING', patient_name: 'Rahul Kumar', appointment_time: '10:00 AM', patient_id: 101, appointment_id: 201 },
        { token_id: 2, token_number: 13, sort_order: 2, status: 'CHECKED_IN', patient_name: 'Sneha Patel', appointment_time: '10:15 AM', patient_id: 102, appointment_id: 202 },
        { token_id: 3, token_number: 11, sort_order: 0, status: 'COMPLETED', patient_name: 'Amit Shah', appointment_time: '09:45 AM', patient_id: 103, appointment_id: 203, completed_at: new Date().toISOString() },
      ]);
      return;
    }
    
    setQueueLoading(true);
    setQueueError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/receptionist/queue`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setQueue(data.queue);
        // If a patient is selected, make sure we keep their updated status
        if (selectedPatient) {
          const updatedPatient = data.queue.find((q: QueueItem) => q.token_id === selectedPatient.token_id);
          if (updatedPatient) setSelectedPatient(updatedPatient);
          else setSelectedPatient(null);
        }
      } else {
        setQueueError(data.detail || 'Failed to load queue.');
      }
    } catch (err) {
      console.error('Failed to fetch queue:', err);
      setQueueError('Network error while fetching queue.');
    } finally {
      setQueueLoading(false);
    }
  };

  useEffect(() => {
    if (token || isDemo) fetchQueue();
  }, [token, isDemo]);

  useEffect(() => {
    if (selectedPatient && (token || isDemo)) {
      // Reset forms and tabs
      setNotes('');
      setMedications([{ medicine_name: '', dosage: '', duration: '' }]);
      setActiveTab('prescription');
      fetchPatientHistory(selectedPatient.patient_id);
      fetchExistingPrescription(selectedPatient.appointment_id);
    }
  }, [selectedPatient, token]);

  const fetchExistingPrescription = async (appointmentId: number) => {
    if (isDemo) {
      if (selectedPatient?.status === 'COMPLETED') {
        setNotes('Patient advised to rest for 3 days and drink plenty of fluids.');
        setMedications([
          { medicine_name: 'Paracetamol 500mg', dosage: '1-1-1 after food', duration: '3 days' },
          { medicine_name: 'Cough Syrup', dosage: '2 tsp morning/night', duration: '5 days' }
        ]);
      } else {
        setNotes('');
        setMedications([{ medicine_name: '', dosage: '', duration: '' }]);
      }
      return;
    }
    setPrescriptionError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/prescriptions/by-appointment/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotes(data.notes || '');
        if (data.medications && data.medications.length > 0) {
          // Map to match MedicationForm
          setMedications(data.medications.map((m: any) => ({
            medicine_name: m.name,
            dosage: m.dosage,
            duration: m.duration
          })));
        }
      } else if (!response.ok) {
        setPrescriptionError(data.detail || 'Failed to load existing prescription.');
      }
    } catch (err) {
      console.error('Failed to fetch existing prescription:', err);
      setPrescriptionError('Network error loading existing prescription.');
    }
  };

  const fetchPatientHistory = async (patientId: number) => {
    if (isDemo) {
      setPatientHistory({
        appointments: [
          { id: 1, appointment_id: 'APT-1001', date: '01/06/2026', time: '10:00 AM', status: 'COMPLETED', reason: 'Fever and cold' }
        ],
        prescriptions: [
          { id: 1, prescription_id: 'RX-5001', date: '01/06/2026', doctor: 'Dr. Kajal Patil', medications_count: 2 }
        ]
      });
      return;
    }
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/patients/${patientId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPatientHistory({ appointments: data.appointments, prescriptions: data.prescriptions });
      } else {
        setHistoryError(data.detail || 'Failed to load patient history.');
      }
    } catch (err) {
      console.error('Failed to fetch patient history:', err);
      setHistoryError('Network error while fetching patient history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdateStatus = async (tokenId: number, status: string) => {
    if (isDemo) {
      setQueue(prev => prev.map(q => q.token_id === tokenId ? { ...q, status, completed_at: status === 'COMPLETED' ? new Date().toISOString() : undefined } : q));
      return;
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/receptionist/queue/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token_id: tokenId, status })
      });
      if (response.ok) {
        fetchQueue();
      } else {
        showToast('Failed to update status.', 'error');
      }
    } catch (err) {
      showToast('Error updating status.', 'error');
    }
  };

  const handleAddMedicationRow = () => {
    setMedications([...medications, { medicine_name: '', dosage: '', duration: '' }]);
  };

  const handleRemoveMedicationRow = (index: number) => {
    const newMeds = [...medications];
    newMeds.splice(index, 1);
    setMedications(newMeds);
  };

  const handleMedicationChange = (index: number, field: keyof MedicationForm, value: string) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    // Filter out empty rows
    const validMeds = medications.filter(m => m.medicine_name.trim() !== '');

    if (isDemo) {
      showToast(`Demo Mode: Prescription saved!`, 'success');
      await handleUpdateStatus(selectedPatient.token_id, 'COMPLETED');
      setNotes('');
      setMedications([{ medicine_name: '', dosage: '', duration: '' }]);
      setSelectedPatient(null);
      return;
    }

    setSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/prescriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointment_id: selectedPatient.appointment_id,
          patient_id: selectedPatient.patient_id,
          notes: notes,
          medications: validMeds
        })
      });

      const data = await response.json();
      if (response.ok) {
        showToast(`Prescription saved! ID: ${data.prescription_id}`, 'success');
        // Mark as completed
        await handleUpdateStatus(selectedPatient.token_id, 'COMPLETED');
        // Reset form
        setNotes('');
        setMedications([{ medicine_name: '', dosage: '', duration: '' }]);
        setSelectedPatient(null);
      } else {
        showToast(data.detail || 'Failed to save prescription.', 'error');
      }
    } catch (err) {
      showToast('Network error while saving prescription.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Doctor Dashboard | Dr. Kajal Patil</title>
      </Helmet>
      
      <div className="min-h-[80vh] bg-gray-50 pt-32 pb-12 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center border-4 border-sky-50">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-outfit">{isDemo ? 'Demo ' : ''}Doctor Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome, <span className="font-semibold text-sky-600">{displayName}</span></p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (isDemo) showToast('Demo Mode: Feature disabled.', 'info');
                  else setIsPasswordModalOpen(true);
                }}
                className="px-5 py-2.5 border border-sky-600 text-sm font-medium rounded-3xl text-sky-600 bg-transparent hover:bg-sky-50 transition-colors shadow-sm font-bold whitespace-nowrap"
              >
                Update Password
              </button>
              <button
                onClick={() => {
                  if (isDemo) showToast('Demo Mode: Feature disabled.', 'info');
                  else logout();
                }}
                className="px-5 py-2.5 border border-transparent text-sm font-medium rounded-3xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors shadow-sm font-bold"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Live Queue */}
            <div className="lg:col-span-1 h-full">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-10rem)] sticky top-24">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 font-outfit flex items-center">
                    <span className="relative flex h-3 w-3 mr-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                    Live Queue
                  </h3>
                  <button onClick={fetchQueue} className="text-sky-600 hover:text-sky-800 p-2 rounded-full hover:bg-sky-50 transition-colors">
                    <svg className={`w-5 h-5 ${queueLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-1 py-1 pr-3 space-y-3 custom-scrollbar">
                  {queueError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-3xl text-sm border border-red-200 mb-3">
                      {queueError}
                    </div>
                  )}
                  {queue.length === 0 && !queueError ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      </div>
                      <p className="text-gray-500 font-medium">Queue is empty</p>
                      <p className="text-xs text-gray-400 mt-1">No tokens assigned for today.</p>
                    </div>
                  ) : (
                    displayQueue.map((q) => (
                      <div 
                        key={q.token_id} 
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                          selectedPatient?.token_id === q.token_id 
                            ? 'border-2 border-sky-500 bg-sky-50/50 shadow-md ring-4 ring-sky-500/10 transform scale-[1.02]' 
                            : q.status === 'SERVING' 
                              ? 'bg-gradient-to-r from-sky-50 to-white border-sky-200 shadow-sm hover:shadow-md hover:-translate-y-0.5' 
                              : q.status === 'COMPLETED'
                                ? 'bg-gray-100 border-gray-300 opacity-80 hover:opacity-100 hover:shadow-sm'
                              : q.status === 'CHECKED_IN' 
                                ? 'bg-white border-gray-200 hover:border-sky-300 hover:shadow-sm' 
                                : 'bg-gray-50 border-gray-100 opacity-60'
                        }`}
                        onClick={() => {
                          if (q.status === 'SERVING' || q.status === 'COMPLETED') setSelectedPatient(q);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-full font-bold mr-3 ${q.status === 'SERVING' ? 'bg-sky-600 text-white shadow-inner' : 'bg-gray-100 text-gray-700'}`}>
                              <span className="text-xs font-normal opacity-80 leading-none">Token</span>
                              <span className="text-lg leading-tight">{q.token_number}</span>
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block truncate max-w-[120px]" title={q.patient_name}>{q.patient_name}</span>
                              <span className="text-xs text-gray-500 font-medium">{q.appointment_time}</span>
                            </div>
                          </div>
                          
                          {/* Doctor Actions */}
                          <div>
                            {q.status === 'CHECKED_IN' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(q.token_id, 'SERVING'); }}
                                className="px-3 py-2 text-xs bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors shadow-sm"
                              >
                                Call Patient
                              </button>
                            )}
                            
                            {(q.status === 'SERVING' || q.status === 'COMPLETED') && selectedPatient?.token_id !== q.token_id && (
                              <button 
                                className="px-3 py-2 text-xs bg-white border border-sky-600 text-sky-700 font-bold rounded-xl hover:bg-sky-50 transition-colors"
                              >
                                {q.status === 'COMPLETED' ? 'Edit Rx' : 'Write Rx'} &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Prescription Panel */}
            <div className="lg:col-span-2">
              {!selectedPatient ? (
                <div className="h-full min-h-[500px] bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-outfit mb-3">No Active Consultation</h2>
                  <p className="text-gray-500 max-w-md mx-auto text-lg">
                    Select a patient from the queue who is currently <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">SERVING</span> or <span className="font-bold text-gray-700 bg-gray-200 px-2 py-0.5 rounded">COMPLETED</span> to write or edit their prescription.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden flex flex-col h-full">
                  
                  {/* Patient Header */}
                  <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-6 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex flex-col items-center justify-center border border-white/30 shadow-sm">
                        <span className="text-xs uppercase tracking-widest font-medium opacity-80">Token</span>
                        <span className="text-2xl font-bold leading-none">{selectedPatient.token_number}</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold font-outfit">{selectedPatient.patient_name}</h2>
                        <p className="text-sky-100 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Appointment: {selectedPatient.appointment_time}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedPatient(null)}
                      className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-3xl transition-colors border border-white/20"
                      title="Close"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex border-b border-gray-200 bg-gray-50/50">
                    <button 
                      onClick={() => setActiveTab('prescription')}
                      className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'prescription' ? 'text-sky-700 border-b-2 border-sky-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                      Write Prescription
                    </button>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center ${activeTab === 'history' ? 'text-sky-700 border-b-2 border-sky-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                      Patient History
                      {historyLoading && <svg className="animate-spin ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    </button>
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    {activeTab === 'prescription' ? (
                      <form onSubmit={handleSubmitPrescription} className="space-y-8">
                      {prescriptionError && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-3xl text-sm border border-red-200 mb-4">
                          {prescriptionError}
                        </div>
                      )}
                      
                      {/* Medications List */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Medications</label>
                        </div>
                        
                        <div className="space-y-3">
                          {medications.map((med, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg relative group transition-colors hover:border-sky-200">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Medicine Name</label>
                                <input 
                                  type="text" 
                                  required
                                  value={med.medicine_name}
                                  onChange={(e) => handleMedicationChange(idx, 'medicine_name', e.target.value)}
                                  placeholder="e.g., Paracetamol 500mg"
                                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                />
                              </div>
                              <div className="sm:w-1/4">
                                <label className="block text-xs text-gray-500 mb-1">Dosage</label>
                                <input 
                                  type="text" 
                                  required
                                  value={med.dosage}
                                  onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)}
                                  placeholder="e.g., 1-0-1 after food"
                                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                />
                              </div>
                              <div className="sm:w-1/4">
                                <label className="block text-xs text-gray-500 mb-1">Duration</label>
                                <input 
                                  type="text" 
                                  required
                                  value={med.duration}
                                  onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)}
                                  placeholder="e.g., 5 days"
                                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                />
                              </div>
                              {medications.length > 1 && (
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveMedicationRow(idx)}
                                  className="absolute -right-2 -top-2 bg-red-100 text-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200"
                                  title="Remove medicine"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <button 
                          type="button"
                          onClick={handleAddMedicationRow}
                          className="mt-4 flex items-center text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-lg"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                          Add Another Medicine
                        </button>
                      </div>
                      
                      {/* Notes / Advice */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Doctor's Advice / Notes</label>
                        <textarea 
                          rows={4}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="General advice, follow-up instructions, dietary restrictions..."
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow resize-none"
                        ></textarea>
                      </div>
                      
                      {/* Submit */}
                      <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                          type="submit"
                          disabled={submitting || medications[0].medicine_name === ''}
                          className={`flex items-center px-8 py-3 rounded-lg shadow-md text-white font-bold text-lg transition-all ${
                            submitting || medications[0].medicine_name === '' 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                          }`}
                        >
                          {submitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              {selectedPatient.status === 'COMPLETED' ? 'Update Prescription' : 'Complete Visit & Generate Rx'}
                              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                    ) : (
                      <div className="space-y-8">
                        {historyError && (
                          <div className="p-4 bg-red-50 text-red-700 rounded-3xl text-sm border border-red-200 mb-4">
                            {historyError}
                          </div>
                        )}
                        {/* Prescriptions History */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4 font-outfit border-b pb-2">Past Prescriptions</h3>
                          {!patientHistory?.prescriptions || patientHistory.prescriptions.length === 0 ? (
                            <p className="text-gray-500 italic">No past prescriptions found.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {patientHistory.prescriptions.map(p => (
                                <div key={p.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:border-sky-300 transition-colors">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded border border-sky-200">
                                      {p.prescription_id}
                                    </span>
                                    <span className="text-sm font-medium text-gray-500">{p.date}</span>
                                  </div>
                                  <p className="text-sm text-gray-700"><strong>Doctor:</strong> {p.doctor}</p>
                                  <p className="text-sm text-gray-700"><strong>Medications:</strong> {p.medications_count}</p>
                                  <button className="mt-3 text-sky-600 text-sm font-bold hover:text-sky-800">View Details &rarr;</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Appointments History */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4 font-outfit border-b pb-2">Past Appointments</h3>
                          {!patientHistory?.appointments || patientHistory.appointments.length === 0 ? (
                            <p className="text-gray-500 italic">No past appointments found.</p>
                          ) : (
                            <div className="overflow-hidden rounded-3xl border border-gray-200">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {patientHistory.appointments.map(a => (
                                    <tr key={a.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                        {a.date} <span className="text-gray-500">{a.time}</span>
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          a.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                          a.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {a.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-500">{a.reason}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
      
      <UpdatePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </>
  );
};

export default DoctorDashboard;
