import React from 'react';
import ReactDOM from 'react-dom';
// NOTE: Bootstrap CSS import removed — it was overriding the CGL Prep Pro
// dark theme colors and making text invisible throughout the app.
// Do NOT re-add 'bootstrap/dist/css/bootstrap.min.css' here.
import App from './App';

const rootEl = document.getElementById('root');

if (rootEl) {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    rootEl
  );
}