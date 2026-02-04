import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

const AdminDebugPanel = () => {
  const [checks, setChecks] = useState({
    backendRunning: false,
    tokenExists: false,
    adminStatsAPI: false,
    vendorsAPI: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const results = { ...checks };

    // Check 1: Token exists
    const token = localStorage.getItem('token');
    results.tokenExists = !!token;
    console.log('🔑 Token:', token ? 'Found' : 'Not found');

    // Check 2: Backend running
    try {
      const healthCheck = await fetch('http://localhost:5000/health');
      results.backendRunning = healthCheck.ok;
      console.log('🏥 Health check:', healthCheck.ok ? 'OK' : 'Failed');
    } catch (err) {
      results.backendRunning = false;
      console.log('❌ Backend not running');
    }

    // Check 3: Admin stats API
    if (token) {
      try {
        const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsResponse.json();
        results.adminStatsAPI = statsResponse.ok && statsData.success;
        console.log('📊 Stats API:', statsData);
      } catch (err) {
        results.adminStatsAPI = false;
        console.log('❌ Stats API error:', err);
      }
    }

    // Check 4: Vendors API
    if (token) {
      try {
        const vendorsResponse = await fetch('http://localhost:5000/api/admin/vendors?limit=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const vendorsData = await vendorsResponse.json();
        results.vendorsAPI = vendorsResponse.ok && vendorsData.success;
        console.log('🏪 Vendors API:', vendorsData);
      } catch (err) {
        results.vendorsAPI = false;
        console.log('❌ Vendors API error:', err);
      }
    }

    setChecks(results);
    setLoading(false);
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel Diagnostics</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Running diagnostics...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Backend Status */}
              <div className={`p-4 rounded-lg ${checks.backendRunning ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {checks.backendRunning ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Backend Server</p>
                      <p className="text-sm text-gray-600">http://localhost:5000</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    checks.backendRunning 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {checks.backendRunning ? 'Running' : 'Not Running'}
                  </span>
                </div>
                {!checks.backendRunning && (
                  <div className="mt-3 pl-8 text-sm text-red-700">
                    ⚠️ Please start backend: <code className="bg-red-100 px-2 py-1 rounded">cd backend && node server.js</code>
                  </div>
                )}
              </div>

              {/* Token Status */}
              <div className={`p-4 rounded-lg ${checks.tokenExists ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {checks.tokenExists ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    ) : (
                      <XCircle className="w-5 h-5 text-yellow-600 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Authentication Token</p>
                      <p className="text-sm text-gray-600">Required for admin access</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    checks.tokenExists 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {checks.tokenExists ? 'Found' : 'Missing'}
                  </span>
                </div>
                {!checks.tokenExists && (
                  <div className="mt-3 pl-8">
                    <button
                      onClick={handleLogin}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                    >
                      Go to Login
                    </button>
                  </div>
                )}
              </div>

              {/* Admin Stats API */}
              <div className={`p-4 rounded-lg ${checks.adminStatsAPI ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {checks.adminStatsAPI ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Admin Stats API</p>
                      <p className="text-sm text-gray-600">/api/admin/stats</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    checks.adminStatsAPI 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {checks.adminStatsAPI ? 'Working' : 'Not Tested'}
                  </span>
                </div>
              </div>

              {/* Vendors API */}
              <div className={`p-4 rounded-lg ${checks.vendorsAPI ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {checks.vendorsAPI ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Vendors API</p>
                      <p className="text-sm text-gray-600">/api/admin/vendors</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    checks.vendorsAPI 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {checks.vendorsAPI ? 'Working' : 'Not Tested'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={runDiagnostics}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Re-run Diagnostics
                </button>
                {checks.backendRunning && checks.tokenExists && (
                  <button
                    onClick={() => window.location.href = '/admin/dashboard'}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Open Admin Dashboard
                  </button>
                )}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Quick Fix Steps:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  {!checks.backendRunning && <li>Start backend server: <code className="bg-blue-100 px-1 rounded">node server.js</code></li>}
                  {!checks.tokenExists && <li>Login with admin credentials</li>}
                  {checks.backendRunning && checks.tokenExists && !checks.adminStatsAPI && <li>Check admin role and permissions</li>}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4 text-xs font-mono text-green-400">
          <p>Console logs are visible in browser DevTools (F12)</p>
          <p className="mt-2">Token: {localStorage.getItem('token') ? '✓ Present' : '✗ Missing'}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDebugPanel;
