import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import useAuthStore from './store/authStore';
import BrowsePage from './pages/BrowsePage';
import ItineraryPage from './pages/ItineraryPage';
import ScrollToTop from './components/utils/ScrollToTop';
import CreateItineraryPage from './pages/CreateItineraryPage';
import MyListingsPage from './pages/MyListingsPage';
import MyTripsPage from './pages/MyTripsPage';
import CreatorsPage from './pages/CreatorsPage';
import AboutPage from './pages/AboutPage';

// Placeholders
const NotFoundPage = () => <div style={{ padding: '120px 40px', textAlign: 'center' }}><h1>404</h1><p>Lost in space</p></div>;

function App() {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  // On app mount, try to restore the user's session
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <>
     <ScrollToTop />
    <Routes>
      {/* Auth pages have no Layout (no navbar/footer) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Regular pages use the Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="creators" element={<CreatorsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="create" element={<CreateItineraryPage />} />
        <Route path="edit/:id" element={<CreateItineraryPage />} />
        <Route path="my-listings" element={<MyListingsPage />} />
        <Route path="itinerary/:id" element={<ItineraryPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="dashboard" element={<MyTripsPage />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;