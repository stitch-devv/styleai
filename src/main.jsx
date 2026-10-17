import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth'
import { CartProvider } from './cart'
import App from './App'
import './index.css'
createRoot(document.getElementById('root')).render(
  <React.StrictMode><BrowserRouter><AuthProvider><CartProvider><App /></CartProvider></AuthProvider></BrowserRouter></React.StrictMode>)
