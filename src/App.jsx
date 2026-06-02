import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Search from './pages/Search';
import MovieDetails from './pages/MovieDetails';
import AddMovie from './pages/AddMovie';
import './App.css';

// Scroll To Top on route change helper
function ScrollToTop() {
  const { pathname, search } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100 font-sans selection:bg-rose-500/30 selection:text-white antialiased">
      {/* Sticky Glass Navbar */}
      <Navbar />

      {/* Main Pages Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/add-movie" element={<AddMovie />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* Premium Cinematic Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}
