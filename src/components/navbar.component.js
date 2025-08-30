import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">
            🎓 SSC Prep Suite
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  📚 Modules
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/create" className="nav-link">
                  ➕ Create Module
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/user" className="nav-link">
                  👤 Create User
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}
