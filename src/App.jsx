import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TrackStatus from './pages/TrackStatus';
import OCRDemo from './pages/OCRDemo';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-600">
          <h1 className="text-2xl font-bold">Something went wrong.</h1>
          <pre className="mt-4 bg-gray-100 p-4 rounded">{this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Placeholder components until we build them
const NotFound = () => <div className="min-h-screen flex items-center justify-center text-xl">Page Not Found</div>;

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
