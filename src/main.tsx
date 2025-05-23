import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Log API base URL for debugging
const apiUrl = import.meta.env.VITE_API_URL || '/api';
console.log(`API URL: ${apiUrl}`);

// Log environment mode
console.log(`Environment: ${import.meta.env.MODE}`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);