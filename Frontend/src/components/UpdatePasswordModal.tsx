import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Key, CheckCircle } from 'lucide-react';

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/users/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password updated successfully!');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      } else {
        setError(data.detail || 'Failed to update password');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-3zl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scale-in border border-sky-100 relative">
        <button 
          onClick={resetAndClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center mb-4 text-sky-600">
          <Key className="w-6 h-6" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 font-outfit">Update Password</h3>
        <p className="text-gray-500 mb-6 text-sm">Create a new, strong password for your account.</p>
        
        {error && (
          <div className="p-3 mb-4 rounded-2xl bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 mb-4 rounded-2xl bg-green-50 border-l-4 border-green-500 text-green-700 text-sm flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full border-gray-300 rounded-2xl shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm px-4 py-2 border outline-none"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full border-gray-300 rounded-2xl shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm px-4 py-2 border outline-none"
              placeholder="••••••••"
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || success !== ''}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-3xl shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors ${isLoading || success !== '' ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordModal;
