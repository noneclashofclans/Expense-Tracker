import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Landing.css';

const Landing = () => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  return (
    <div className="landing-container">
      <div className="donut-container">
        <div className="donut"></div>
        <div className="donut"></div>
        <div className="donut"></div>
        <div className="donut"></div>
        <div className="donut"></div>
      </div>

      <Navbar />

      <h1>Welcome to MoneyMate💰</h1>
      <h4>Your daily expense tracker, by Rishit Mohanty</h4>
      <p>Track your expenses easily and efficiently.</p>

      {!user && (
        <div className="landing-buttons">
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn">Register</Link>
        </div>
      )}

    </div>
  );
};

export default Landing;
