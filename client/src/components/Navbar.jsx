import React from "react";
import { Link, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Navbar = () => {
    const location = useLocation();
    const path = location.pathname;

    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">
                    💰 MoneyMate
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto gap-lg-3 align-items-center">
                        <li className="nav-item">
                            <Link className={`nav-link ${path === "/" ? "active" : ""}`} to="/">
                                Home
                            </Link>
                        </li>

                        {!user ? (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link ${path === "/login" ? "active" : ""}`} to="/login">
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${path === "/register" ? "active" : ""}`} to="/register">
                                        Register
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <span className="nav-link text-info">Hi, {user.name}</span>
                                </li>
                                {path !== "/dashboard" && (
                                    <li className="nav-item">
                                        <Link className="btn btn-primary btn-sm text-white px-3" to="/dashboard">
                                            Dashboard
                                        </Link>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;