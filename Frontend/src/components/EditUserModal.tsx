import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, UserCheck, CheckCircle } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: number; username: string; name: string; role: string; is_active: boolean } | null;
  onUserUpdated: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPassword('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long if you are changing it.');
      return;
    }

    setIsLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name, 
          password: password ? password : undefined 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('User updated successfully!');
        onUserUpdated();
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      } else {
        setError(data.detail || 'Failed to update user');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scale-in border border-sky-100 relative">
        <button 
          onClick={resetAndClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center mb-4 text-sky-600">
          <UserCheck className="w-6 h-6" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 font-outfit">Edit User: {user.username}</h3>
        <p className="text-gray-500 mb-6 text-sm">Update the name or reset the password for this user.</p>
        
        {error && (
          <div className="p-3 mb-4 rounded-md bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 mb-4 rounded-md bg-green-50 border-l-4 border-green-500 text-green-700 text-sm flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm px-4 py-2 border outline-none"
              placeholder="Full Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm px-4 py-2 border outline-none"
              placeholder="Leave blank to keep current password"
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || success !== ''}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors ${isLoading || success !== '' ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
