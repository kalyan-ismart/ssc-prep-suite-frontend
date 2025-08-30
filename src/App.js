import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from "./components/navbar.component";
import ModulesList from "./components/modules-list.component";
import EditModule from "./components/edit-module.component";
import CreateModule from "./components/create-module.component";
import CreateUser from "./components/create-user.component";

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Bar */}
        <Navbar />
        
        {/* Main Content Area */}
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <Routes>
                {/* Home Route */}
                <Route 
                  path="/" 
                  element={<Navigate to="/modules" replace />} 
                />
                
                {/* Modules Management */}
                <Route 
                  path="/modules" 
                  element={<ModulesList />} 
                />
                <Route 
                  path="/modules/create" 
                  element={<CreateModule />} 
                />
                <Route 
                  path="/modules/edit/:id" 
                  element={<EditModule />} 
                />
                
                {/* Legacy routes for backward compatibility */}
                <Route 
                  path="/create" 
                  element={<Navigate to="/modules/create" replace />} 
                />
                <Route 
                  path="/edit/:id" 
                  element={<Navigate to="/modules/edit/:id" replace />} 
                />
                
                {/* User Management */}
                <Route 
                  path="/users" 
                  element={<CreateUser />} 
                />
                <Route 
                  path="/user" 
                  element={<Navigate to="/users" replace />} 
                />
                
                {/* 404 - Not Found */}
                <Route 
                  path="*" 
                  element={
                    <div className="container mt-5">
                      <div className="row justify-content-center">
                        <div className="col-md-6 text-center">
                          <h2>404 - Page Not Found</h2>
                          <p>The page you're looking for doesn't exist.</p>
                          <Navigate to="/modules" replace />
                        </div>
                      </div>
                    </div>
                  } 
                />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
