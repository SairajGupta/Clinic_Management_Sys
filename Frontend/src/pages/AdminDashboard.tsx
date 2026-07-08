import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import UpdatePasswordModal from '../components/UpdatePasswordModal';
import EditUserModal from '../components/EditUserModal';

interface AdminDashboardProps {
  isDemo?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDemo = false }) => {
  const { role, name, token, logout } = useAuth();
  
  const displayName = isDemo ? 'Demo Admin' : (name || role);
  
  const [username, setUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState('RECEPTIONIST');
  const [status, setStatus] = useState<{type: 'success' | 'error' | '', message: string}>({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  const currentUserUsername = isDemo ? 'admin' : (token ? JSON.parse(atob(token.split('.')[1])).sub : '');

  const fetchUsers = async () => {
    if (isDemo) {
      setUsers([
        { id: 1, username: 'admin', name: 'Demo Admin', role: 'ADMIN' },
        { id: 2, username: 'drkajal', name: 'Dr. Kajal Patil', role: 'DOCTOR' },
        { id: 3, username: 'reception', name: 'Front Desk', role: 'RECEPTIONIST' },
      ]);
      return;
    }
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setUsersError('Failed to load users from the server.');
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      setUsersError('A network error occurred while fetching users.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  React.useEffect(() => {
    if (token || isDemo) {
      fetchUsers();
    }
  }, [token, isDemo]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    setStatus({ type: '', message: '' });

    if (isDemo) {
      setStatus({ type: 'success', message: 'Demo Mode: User created successfully!' });
      setUsername('');
      setNewName('');
      setPassword('');
      setConfirmPassword('');
      setUserRole('RECEPTIONIST');
      return;
    }

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
          name: newName,
          password,
          role: userRole
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: data.message || 'User created successfully!' });
        setUsername('');
        setNewName('');
        setPassword('');
        setConfirmPassword('');
        setUserRole('RECEPTIONIST');
        fetchUsers();
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
      
      <div className="min-h-[70vh] bg-gray-50 pt-32 pb-12 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-outfit">{isDemo ? 'Demo ' : ''}Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome, <span className="font-semibold text-sky-600">{displayName}</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (isDemo) alert('Demo Mode: Feature disabled.');
                  else setIsPasswordModalOpen(true);
                }}
                className="px-4 py-2 border border-sky-600 text-sm font-medium rounded-md text-sky-600 bg-transparent hover:bg-sky-50 transition-colors"
              >
                Update Password
              </button>
              <button
                onClick={() => {
                  if (isDemo) alert('Demo Mode: Feature disabled.');
                  else logout();
                }}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm px-4 py-2 border outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="newName" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="newName"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm px-4 py-2 border outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      id="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm px-4 py-2 border outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm px-4 py-2 border outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    id="role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm px-4 py-2 border bg-white"
                  >
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Creating...' : 'Create User'}
                </button>
              </form>
            </div>
            
            {/* Manage Users List */}
            <div className="bg-white p-8 rounded-lg shadow-sm overflow-hidden flex flex-col max-h-[600px]">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-outfit">Manage Users</h2>
              
              {isLoadingUsers ? (
                <div className="flex-1 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                </div>
              ) : usersError ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-md border-l-4 border-red-500 mb-4">
                  {usersError}
                  <button onClick={fetchUsers} className="ml-4 underline text-red-800 hover:text-red-900">Retry</button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : user.role === 'DOCTOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            {user.username !== currentUserUsername ? (
                               <button 
                                 onClick={() => {
                                   if (isDemo) {
                                     alert('Demo Mode: User editing is disabled.');
                                   } else {
                                     setSelectedUserForEdit(user); 
                                     setIsEditUserModalOpen(true); 
                                   }
                                 }}
                                 className="text-sky-600 hover:text-sky-900 transition-colors"
                               >
                                 Edit
                               </button>
                            ) : (
                              <span className="text-gray-400 text-xs italic">You</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No users found.</div>
                  )}
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
      <EditUserModal 
        isOpen={isEditUserModalOpen} 
        onClose={() => setIsEditUserModalOpen(false)} 
        user={selectedUserForEdit} 
        onUserUpdated={fetchUsers} 
      />
    </>
  );
};

export default AdminDashboard;
