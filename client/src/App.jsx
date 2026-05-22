import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';

// Placeholder pages (we'll build these next)
const BrowsePage = () => <div style={{ padding: '120px 40px', textAlign: 'center' }}><h1>🔍 Browse — coming soon</h1></div>;
const ItineraryPage = () => <div style={{ padding: '120px 40px', textAlign: 'center' }}><h1>📋 Itinerary detail — coming soon</h1></div>;
const LoginPage = () => <div style={{ padding: '120px 40px', textAlign: 'center' }}><h1>🔐 Login — coming soon</h1></div>;
const SignupPage = () => <div style={{ padding: '120px 40px', textAlign: 'center' }}><h1>✨ Sign up — coming soon</h1></div>;
const NotFoundPage = () => <div style={{ padding: '120px 40px', textAlign: 'center' }}><h1>404</h1><p>Lost in space</p></div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="itinerary/:id" element={<ItineraryPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;