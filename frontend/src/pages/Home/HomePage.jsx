import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <main className="home-content">
        <section className="hero">
          <h1>AI-Powered Interview Platform</h1>
          <p>Experience the future of hiring with voice-based assessments</p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary-lg">
              Get Started
            </Link>
            <Link to="/login" className="btn-outline-lg">
              Sign In
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
