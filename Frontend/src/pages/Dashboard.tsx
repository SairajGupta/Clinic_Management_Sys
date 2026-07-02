import React from 'react';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  title: string;
}

const Dashboard: React.FC<DashboardProps> = ({ title }) => {
  const { role, logout } = useAuth();

  return (
    <div className="min-h-[70vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-outfit">{title}</h1>
            <p className="text-gray-600 mt-2">Welcome to your dashboard. Your role is: <span className="font-semibold text-teal-600">{role}</span></p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm min-h-[400px]">
          <p className="text-gray-500 italic">Dashboard features will be implemented here...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
