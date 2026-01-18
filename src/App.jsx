import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AgentHome from './pages/AgentHome';

// ... (existing imports)

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<AgentHome />} /> {/* New Agent Home */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/register" element={<Register />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/track-status" element={<TrackStatus />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
              <Route path="/:agencySlug/dashboard/*" element={<AgentDashboard />} />
              <Route path="/dashboard/*" element={<AgentDashboard />} />
              <Route path="/ocr-demo" element={<OCRDemo />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
