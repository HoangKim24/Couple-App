import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { registerSW } from 'virtual:pwa-register';

// Tự động kích hoạt và cập nhật Service Worker PWA ngay lập tức
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
