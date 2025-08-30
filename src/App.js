import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from "./components/navbar.component";
import ModulesList from "./components/modules-list.component";
import EditModule from "./components/edit-module.component";
import CreateModule from "./components/create-module.component";
import CreateUser from "./components/create-user.component";

function App() {
  return (
    <Router>
      <div className="container">
        <Navbar />
        <br/>
        <Routes>
          <Route path="/" element={<ModulesList />} />
          <Route path="/edit/:id" element={<EditModule />} />
          <Route path="/create" element={<CreateModule />} />
          <Route path="/user" element={<CreateUser />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;