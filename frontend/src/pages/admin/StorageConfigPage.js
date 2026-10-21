import React, { useState, useEffect } from 'react';
import { 
  FiServer, 
  FiCloud, 
  FiActivity, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiTerminal, 
  FiLayers, 
  FiLock 
} from 'react-icons/fi';
import api from '../../services/api';
import storageConfig, { updateStorageConfig } from '../../config/storageConfig';

const StorageConfigPage = () => {
  const [apiUrl, setApiUrl] = useState(storageConfig.apiBaseUrl);
  const [testing, setTesting] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [latency, setLatency] = useState(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('status'); // 'status', 'topology', 'gcp'

  useEffect(() => {
    checkServiceHealth();
  }, []);

  const checkServiceHealth = async () => {
    setTesting(true);
    const start = performance.now();
    try {
      const response = await api.get('/health');
      const roundTrip = Math.round(performance.now() - start);
      setLatency(roundTrip);
      setHealthStatus({
        online: true,
        data: response.data,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (err) {
      const roundTrip = Math.round(performance.now() - start);
      setLatency(roundTrip);
      setHealthStatus({
        online: false,
        error: err.message || 'Service unavailable',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    updateStorageConfig({ apiBaseUrl: apiUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600">
                <FiServer className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
                  System & Cloud Infrastructure
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Live SOA Microservices Topology, Spring Boot Health, & GCP Cloud Deployment Status
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={checkServiceHealth}
              disabled={testing}
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
            >
              <FiRefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              Test Health Probe
            </button>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SOA Microservice</span>
              {healthStatus?.online ? (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              ) : (
                <span className="h-3 w-3 rounded-full bg-red-500"></span>
              )}
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {healthStatus?.online ? 'UP (Port 5000)' : 'Unreachable'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Spring Boot 3.2.5 REST Service
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Response Latency</span>
              <FiActivity className="text-blue-500" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {latency !== null ? `${latency} ms` : 'Measuring...'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Round-trip HTTP probe
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Eureka Discovery</span>
              <FiLayers className="text-purple-500" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              Port 8761
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Netflix Eureka Server
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">GCP Target</span>
              <FiCloud className="text-amber-500" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              Cloud Run
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ready for container deployment
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'status'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Live Probe & Gateway Settings
          </button>
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'topology'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Microservices Topology
          </button>
          <button
            onClick={() => setActiveTab('gcp')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
              activeTab === 'gcp'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Google Cloud Platform (GCP) Readiness
          </button>
        </div>

        {/* Tab 1: Live Status & API Base URL */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            {saved && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
                <span>API configuration saved successfully!</span>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FiTerminal className="text-primary-600" />
                Backend Gateway & Probe Configuration
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Configure the API routing endpoint. In local development, the React frontend proxies to port 5000 (`/api`).
                When deploying to Google Cloud Run, set this to your Cloud Run service URL or keep relative `/api` behind Cloud Load Balancing.
              </p>

              <form onSubmit={handleSaveApiUrl} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Active API Base URL
                  </label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://localhost:5000/api or /api"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Default local: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">http://localhost:5000/api</code> | Cloud Run: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">https://soa-service-&lt;project&gt;.run.app/api</code>
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary px-6 py-2.5 text-sm">
                    Save API Configuration
                  </button>
                  <button
                    type="button"
                    onClick={checkServiceHealth}
                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium"
                  >
                    Ping Probe
                  </button>
                </div>
              </form>
            </div>

            {/* Health Probe Diagnostic Payload */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <FiActivity className="text-green-600" />
                Latest Health Diagnostic Payload
              </h3>
              {healthStatus ? (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                  <p className="text-emerald-400 font-bold mb-2">
                    ✓ Status: {healthStatus.online ? '200 OK' : 'FAILED'} (Timestamp: {healthStatus.timestamp})
                  </p>
                  <pre>{JSON.stringify(healthStatus.data || healthStatus.error, null, 2)}</pre>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No probe executed yet. Click "Test Health Probe" above.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Architecture Topology */}
        {activeTab === 'topology' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FiLayers className="text-primary-600" />
                Multi-Tier SOA System Architecture
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gradient-to-br from-blue-50/50 to-white dark:from-gray-800 dark:to-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-blue-700 dark:text-blue-400">1. Client Layer</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">Port 3000</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">React 18 SPA</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                    <li>• Tailwind CSS & Dark Mode support</li>
                    <li>• Context API (Auth, Cart, DarkMode)</li>
                    <li>• Axios client with automatic Bearer token interceptor</li>
                    <li>• QR Code & UPI checkout generator</li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gradient-to-br from-green-50/50 to-white dark:from-gray-800 dark:to-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-green-700 dark:text-green-400">2. Service Layer</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">Port 5000</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Spring Boot Microservice</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                    <li>• 12 REST Controllers (Catalog, Orders, Reservations, Coupons)</li>
                    <li>• Spring Security 6 with stateless JWT filter</li>
                    <li>• Dynamic PORT binding for Google Cloud Run</li>
                    <li>• All 8 PS002 Workbook test suites passing</li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gradient-to-br from-purple-50/50 to-white dark:from-gray-800 dark:to-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-purple-700 dark:text-purple-400">3. Persistence Layer</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">JPA / SQL</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Repositories</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                    <li>• Spring Data JPA Repositories</li>
                    <li>• In-memory H2 with Web Console (`/h2-console`)</li>
                    <li>• GCP Cloud SQL (PostgreSQL/MySQL) compatible</li>
                    <li>• Transactional integrity on Orders & Reservations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: GCP Cloud Readiness */}
        {activeTab === 'gcp' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                <FiCloud className="text-amber-500" />
                Google Cloud Platform (GCP) Deployment Readiness
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                The entire Lumière backend is pre-configured for instant zero-friction deployment to Google Cloud Platform using Google Cloud Run and Google Artifact Registry.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiCheckCircle className="text-green-500" /> Cloud Run Specifications
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-500">Service Name:</span>
                      <span className="font-mono font-semibold">soa-service</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-500">Container Port:</span>
                      <span className="font-mono font-semibold">${`{PORT:5000}`}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-500">Health Probes:</span>
                      <span className="font-mono font-semibold">/health, /api/health</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Auth Method:</span>
                      <span className="font-semibold text-green-600">Stateless JWT Bearer</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiLock className="text-blue-500" /> Required GCP Environment Variables
                  </h3>
                  <div className="space-y-2 text-xs font-mono text-gray-800 dark:text-gray-200">
                    <p className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                      PORT=8080 (injected automatically by Cloud Run)
                    </p>
                    <p className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                      SPRING_PROFILES_ACTIVE=prod
                    </p>
                    <p className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                      JWT_SECRET=&lt;your-secure-jwt-secret&gt;
                    </p>
                    <p className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                      SPRING_DATASOURCE_URL=&lt;Cloud SQL Connection&gt;
                    </p>
                  </div>
                </div>
              </div>

              {/* Deployment Steps Summary */}
              <div className="mt-6 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-2">
                  When you attach your GCP details:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800 dark:text-amber-300">
                  <li>Provide your GCP Project ID, region (e.g. <code className="font-mono">asia-south1</code> or <code className="font-mono">us-central1</code>).</li>
                  <li>Run <code className="font-mono font-bold">deploy-to-gcp.bat &lt;YOUR_PROJECT_ID&gt;</code> to automatically build the Docker image, upload to Google Artifact Registry, and launch on Cloud Run.</li>
                  <li>Copy the resulting Cloud Run HTTPS URL and plug it into this page or frontend environment variables.</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageConfigPage;
