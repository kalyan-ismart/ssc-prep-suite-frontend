import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
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