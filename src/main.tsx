import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter'; // 혹은 ./Router 등
import './index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
