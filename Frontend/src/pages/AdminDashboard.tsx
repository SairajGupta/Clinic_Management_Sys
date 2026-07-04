import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const AdminDashboard: React.FC = () => {
  const { role, token, logout } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('RECEPTIONIST');
  const [status, setStatus] = useState<{type: 'success' | 'error' | '', message: string}>({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          password,
          role: userRole
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: data.message || 'User created successfully!' });
        setUsername('');
        setPassword('');
        setUserRole('RECEPTIONIST');
      } else {
        setStatus({ type: 'error', message: data.detail || 'Failed to create user.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'A network error occurred. Is the server running?' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Dr. Kajal Patil</title>
      </Helmet>
      
      <div className="min-h-[70vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white p-8 rounded-lg shadow-sm flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-outfit">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome to your dashboard. Your role is: <span className="font-semibold text-teal-600">{role}</span></p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Create User Form */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-outfit">Create Staff User</h2>
              
              {status.message && (
                <div className={`p-4 mb-6 rounded-md ${status.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-700' : 'bg-red-50 border-l-4 border-red-500 text-red-700'}`}>
                  {status.message}
                </div>
              )}
              
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    id="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm px-4 py-2 border"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm px-4 py-2 border"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    id="role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm px-4 py-2 border bg-white"
                  >
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Creating...' : 'Create User'}
                </button>
              </form>
            </div>
            
            {/* Quick Stats / Info Placeholder */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-8 rounded-lg shadow-sm text-white flex flex-col justify-center items-center text-center">
              <svg className="w-16 h-16 mb-4 text-teal-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <h3 className="text-2xl font-bold font-outfit mb-2">Staff Management</h3>
              <p className="text-teal-100 max-w-sm">
                Use the form to create new accounts for your clinic's doctors and receptionists. Only users with these accounts can access the staff portals.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
