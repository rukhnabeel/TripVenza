import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AgentHome from './pages/AgentHome';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import Maintenance from './pages/Maintenance';
import TrackStatus from './pages/TrackStatus';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import OCRDemo from './pages/OCRDemo';
import ErrorBoundary from './components/ErrorBoundary';

const NotFound = () => (
  <div className="flex h-screen items-center justify-center flex-col">
    <h1 className="text-4xl font-bold text-gray-900">404</h1>
    <p className="text-gray-500 mt-2">Page Not Found</p>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<AgentHome />} />
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
