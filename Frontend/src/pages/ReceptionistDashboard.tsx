import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import UpdatePasswordModal from '../components/UpdatePasswordModal';

interface QueueItem {
  token_id: number;
  token_number: number;
  sort_order: number;
  status: string;
  patient_name: string;
  appointment_time: string;
  patient_id: number;
  completed_at?: string;
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

interface PatientData {
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    dob: string;
    gender: string;
    email: string | null;
  };
  appointments: Appointment[];
  prescriptions: Prescription[];
}

const ReceptionistDashboard: React.FC = () => {
  const { name, role, token, logout } = useAuth();
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [phoneSearch, setPhoneSearch] = useState('');
  const [searchResults, setSearchResults] = useState<PatientData[] | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Track which tab is active for each patient result (using patient id as key)
  const [activeTabs, setActiveTabs] = useState<Record<number, 'appointments' | 'prescriptions'>>({});

  // Queue state
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);

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

  const fetchQueue = async () => {
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

  const handleLookupById = async (patientId: number) => {
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/receptionist/lookup?patient_id=${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.results);
        if (data.results.length === 0) {
          setError('Patient not found.');
          setSelectedPatientId(null);
        } else {
          // Default to appointments tab
          const newTabs: Record<number, 'appointments' | 'prescriptions'> = {};
          data.results.forEach((r: PatientData) => {
            newTabs[r.patient.id] = 'appointments';
          });
          setActiveTabs(newTabs);

          if (data.results.length === 1) {
            setSelectedPatientId(data.results[0].patient.id);
          }
        }
      } else {
        setError(data.detail || 'Lookup failed.');
      }
    } catch (err) {
      setError('Failed to fetch patient records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchQueue();
  }, [token]);

  const handleCheckIn = async (appointmentId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/receptionist/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appointment_id: appointmentId })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchQueue();
        if (phoneSearch) {
          // Trigger search refresh implicitly
          handleSearch({ preventDefault: () => { } } as any);
        }
      } else {
        alert(data.detail);
      }
    } catch (err) {
      alert('Error checking in patient.');
    }
  };

  const handleMoveQueue = async (tokenId: number, afterTokenId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/receptionist/queue/move`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token_id: tokenId, after_token_id: afterTokenId })
      });
      if (response.ok) {
        fetchQueue();
      }
    } catch (err) {
      alert('Error moving token.');
    }
  };

  const handleUpdateStatus = async (tokenId: number, status: string) => {
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
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneSearch.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/receptionist/lookup?phone=${encodeURIComponent(phoneSearch)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.results);
        if (data.results.length === 0) {
          setError('No patients found with that phone number.');
          setSelectedPatientId(null);
        } else {
          // Default to appointments tab for all results
          const newTabs: Record<number, 'appointments' | 'prescriptions'> = {};
          data.results.forEach((r: PatientData) => {
            newTabs[r.patient.id] = 'appointments';
          });
          setActiveTabs(newTabs);

          if (data.results.length === 1) {
            setSelectedPatientId(data.results[0].patient.id);
          } else {
            setSelectedPatientId(null);
          }
        }
      } else {
        setError(data.detail || 'Failed to search patients.');
      }
    } catch (err) {
      setError('Network error occurred while searching.');
    } finally {
      setIsLoading(false);
    }
  };

  const setTab = (patientId: number, tab: 'appointments' | 'prescriptions') => {
    setActiveTabs(prev => ({ ...prev, [patientId]: tab }));
  };

  return (
    <>
      <Helmet>
        <title>Receptionist Dashboard | Dr. Kajal Patil</title>
      </Helmet>

      <div className="min-h-[80vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-outfit">Receptionist Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome, <span className="font-semibold text-sky-600">{name || role}</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-5 py-2.5 border border-sky-600 text-sm font-medium rounded-full text-sky-600 bg-transparent hover:bg-sky-50 transition-colors shadow-sm whitespace-nowrap"
              >
                Update Password
              </button>
              <button
                onClick={logout}
                className="px-5 py-2.5 border border-transparent text-sm font-medium rounded-full text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Lookup & Booking */}
            <div className="lg:col-span-1 space-y-6">

              {/* Patient Lookup Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-outfit">Patient Lookup</h2>

                <form onSubmit={handleSearch} className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        value={phoneSearch}
                        onChange={(e) => setPhoneSearch(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-shadow"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !phoneSearch.trim()}
                    className={`mt-auto w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}`}
                  >
                    {isLoading ? 'Searching...' : 'Search Records'}
                  </button>
                </form>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Book Appointment Card */}
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-sky-100 flex flex-col">
                <h3 className="text-xl font-bold text-sky-900 mb-2 font-outfit">Walk-in Booking</h3>
                <p className="text-sky-700 text-sm mb-6 flex-1">Register new patients or book an appointment for an existing walk-in patient.</p>

                <Link
                  to="/appointment"
                  state={{ fromDashboard: true }}
                  className="mt-auto w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Book Walk-in
                </Link>
              </div>
            </div>

            {/* Right Column: Results OR Token Management */}
            <div className="lg:col-span-2 h-full">
              {isLoading && (
                <div className="h-full min-h-[400px] bg-white rounded-2xl shadow-sm flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                </div>
              )}

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 font-outfit">Search Results</h2>
                    <button
                      onClick={() => { setSearchResults(null); setPhoneSearch(''); setSelectedPatientId(null); }}
                      className="px-4 py-2 bg-gray-50 text-gray-700 hover:text-sky-600 hover:bg-sky-50 font-medium rounded-lg shadow-sm border border-gray-200 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                      Back to Dashboard
                    </button>
                  </div>

                  {/* Selection View */}
                  {searchResults.length > 1 && selectedPatientId === null && (
                    <>
                      <h2 className="text-xl font-bold text-gray-900 font-outfit px-2">Multiple Patients Found ({searchResults.length})</h2>
                      <p className="text-gray-600 px-2 mb-4">Please select a patient to view their records.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.map((result) => (
                          <div
                            key={result.patient.id}
                            onClick={() => setSelectedPatientId(result.patient.id)}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:border-sky-400 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-lg font-bold font-outfit group-hover:bg-sky-100 transition-colors">
                                {result.patient.first_name[0]}{result.patient.last_name ? result.patient.last_name[0] : ''}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 font-outfit group-hover:text-sky-700">{result.patient.first_name} {result.patient.last_name}</h3>
                                {result.patient.dob && <p className="text-sm text-gray-500">DOB: {result.patient.dob}</p>}
                                <p className="text-xs text-gray-400 mt-1">{result.appointments.length} Visits</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Detail View */}
                  {selectedPatientId !== null && searchResults.filter(r => r.patient.id === selectedPatientId).map((result) => (
                    <div key={result.patient.id} className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                        <h2 className="text-xl font-bold text-gray-900 font-outfit">Patient Records</h2>
                        {searchResults.length > 1 && (
                          <button
                            onClick={() => setSelectedPatientId(null)}
                            className="text-sm text-sky-600 hover:text-sky-800 font-medium flex items-center transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Back to list
                          </button>
                        )}
                      </div>

                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Patient Info Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xl font-bold font-outfit">
                              {result.patient.first_name[0]}{result.patient.last_name ? result.patient.last_name[0] : ''}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 font-outfit">{result.patient.first_name} {result.patient.last_name}</h3>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>{result.patient.phone}</span>
                                {result.patient.dob && <span>• DOB: {result.patient.dob}</span>}
                                {result.patient.gender && <span className="capitalize">• {result.patient.gender}</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tabs */}
                        <div className="px-6 pt-4 border-b border-gray-100 flex gap-6">
                          <button
                            onClick={() => setTab(result.patient.id, 'appointments')}
                            className={`pb-4 font-medium text-sm transition-colors relative ${activeTabs[result.patient.id] === 'appointments' ? 'text-sky-600' : 'text-gray-500 hover:text-gray-800'}`}
                          >
                            Visits / Appointments
                            {activeTabs[result.patient.id] === 'appointments' && (
                              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 rounded-t-full"></span>
                            )}
                          </button>
                          <button
                            onClick={() => setTab(result.patient.id, 'prescriptions')}
                            className={`pb-4 font-medium text-sm transition-colors relative ${activeTabs[result.patient.id] === 'prescriptions' ? 'text-sky-600' : 'text-gray-500 hover:text-gray-800'}`}
                          >
                            Prescriptions
                            {activeTabs[result.patient.id] === 'prescriptions' && (
                              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 rounded-t-full"></span>
                            )}
                          </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 bg-white min-h-[250px]">

                          {/* Appointments Tab */}
                          {activeTabs[result.patient.id] === 'appointments' && (
                            <div className="space-y-4">
                              {result.appointments.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No visit history found.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apt ID</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                      {result.appointments.map(appt => (
                                        <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {appt.date} <span className="text-gray-500 font-normal">{appt.time}</span>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{appt.appointment_id}</td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${appt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                appt.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
                                                  appt.status === 'CHECKED_IN' ? 'bg-sky-100 text-sky-800' :
                                                    'bg-gray-100 text-gray-800'
                                              }`}>
                                              {appt.status}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{appt.reason}</td>
                                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            {appt.status === 'BOOKED' && appt.date === new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) && (
                                              <button
                                                onClick={() => handleCheckIn(appt.id)}
                                                className="text-sky-600 hover:text-sky-900 bg-sky-50 px-3 py-1 rounded-full text-xs font-bold"
                                              >
                                                Check In
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Prescriptions Tab */}
                          {activeTabs[result.patient.id] === 'prescriptions' && (
                            <div className="space-y-4">
                              {result.prescriptions.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No prescriptions found.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {result.prescriptions.map(presc => (
                                    <div key={presc.id} className="border border-gray-200 rounded-xl p-4 hover:border-sky-300 hover:shadow-md transition-all group">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2 py-1 rounded">{presc.date}</span>
                                        <span className="text-gray-400 text-xs font-mono">{presc.prescription_id}</span>
                                      </div>
                                      <h4 className="font-bold text-gray-900 mt-2">{presc.doctor}</h4>
                                      <p className="text-sm text-gray-500 mb-4">{presc.medications_count} Medications prescribed</p>

                                      <Link
                                        to={`/prescription?id=${presc.prescription_id}`}
                                        target="_blank"
                                        className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 group-hover:underline"
                                      >
                                        View / Print PDF
                                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults === null && !isLoading && (
                /* Token Management Card */
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-10rem)] sticky top-24">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 font-outfit">Live Queue</h3>
                    <button onClick={fetchQueue} className="text-sky-600 hover:text-sky-800">
                      <svg className={`w-5 h-5 ${queueLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {queueError && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 mb-3">
                        {queueError}
                      </div>
                    )}
                    {queue.length === 0 && !queueError ? (
                      <p className="text-gray-500 text-sm text-center py-4">No tokens assigned for today yet.</p>
                    ) : (
                      displayQueue.map((q, idx) => (
                        <div 
                          key={q.token_id} 
                          onClick={() => handleLookupById(q.patient_id)}
                          className={`p-4 rounded-xl border cursor-pointer hover:shadow-md hover:border-sky-300 transition-all ${q.status === 'SERVING' ? 'bg-sky-50 border-sky-200 shadow-sm' : q.status === 'CHECKED_IN' ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className={`flex items-center justify-center w-12 h-12 rounded-lg font-bold text-xl mr-4 ${q.status === 'SERVING' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                #{q.token_number}
                              </div>
                              <div>
                                <span className="font-medium text-lg text-gray-900">{q.patient_name}</span>
                                <p className="text-sm text-gray-500">{q.appointment_time} • {q.status}</p>
                              </div>
                            </div>

                            {/* Queue Actions */}
                            {q.status === 'CHECKED_IN' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(q.token_id, 'SERVING'); }}
                                  className="px-3 py-1.5 text-sm bg-sky-100 text-sky-700 font-medium rounded-lg hover:bg-sky-200 transition-colors"
                                  title="Mark as Serving"
                                >
                                  Serve
                                </button>

                                {/* Move down button (swap with next if exists) */}
                                {idx < displayQueue.length - 1 && displayQueue[idx + 1].status === 'CHECKED_IN' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMoveQueue(q.token_id, displayQueue[idx + 1].token_id); }}
                                    className="p-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                    title="Patient hasn't arrived, move down"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                                  </button>
                                )}
                              </div>
                            )}

                            {q.status === 'SERVING' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(q.token_id, 'COMPLETED'); }}
                                className="px-3 py-1.5 text-sm bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition-colors"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      ))
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

export default ReceptionistDashboard;
