/**
 * main.jsx
 * 
 * THE ENTRY POINT.
 * This file is the very first thing that runs.
 * It grabs the "root" div from index.html and inserts the React App into it.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
