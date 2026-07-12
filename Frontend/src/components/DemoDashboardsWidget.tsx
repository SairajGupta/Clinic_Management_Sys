import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ChevronDown } from 'lucide-react';

export default function DemoDashboardsWidget() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="fixed top-20 left-0 right-0 z-40 px-4 flex justify-between items-start pointer-events-none sm:top-32 sm:left-auto sm:right-4 sm:px-0 sm:block">
      <div className="sm:hidden pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-3xl shadow-sm border border-blue-200 font-bold text-blue-700 text-sm flex items-center h-10">
          Dr. Kajal Patil
        </div>
      </div>
      <div className="relative pointer-events-auto">
        <button
          onClick={() => setDemoOpen(!demoOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-3xl text-sm font-bold text-indigo-700 bg-white/95 backdrop-blur-md hover:bg-indigo-50 shadow-sm border border-indigo-200 transition-all duration-200 h-10"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="hidden sm:inline">Demo Dashboards</span>
          <span className="sm:hidden">Demos</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${demoOpen ? 'rotate-180' : ''}`} />
        </button>

        {demoOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDemoOpen(false)} />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-elevated border border-indigo-100 overflow-hidden z-50 animate-scale-in">
              <Link
                to="/demo/doctor"
                onClick={() => setDemoOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-dark hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
              >
                Doctor Dashboard
              </Link>
              <Link
                to="/demo/receptionist"
                onClick={() => setDemoOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-dark hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150 border-t border-gray-100"
              >
                Receptionist Dashboard
              </Link>
              <Link
                to="/demo/admin"
                onClick={() => setDemoOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-dark hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150 border-t border-gray-100"
              >
                Admin Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
