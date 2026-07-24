import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg px-3 rounded">
        <Link to="/" className="navbar-brand fw-bold">SSC Prep Suite</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">Modules</Link>
            </li>
            <li className="nav-item">
              <Link to="/create" className="nav-link">Create Module Log</Link>
            </li>
            <li className="nav-item">
              <Link to="/user" className="nav-link">Create User</Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}