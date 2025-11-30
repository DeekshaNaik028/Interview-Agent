import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Page Not Found</p>
      <Link to="/" className="home-link">
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;