import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Portfolio  from './pages/Portfolio/Portfolio'
import ReviewPage from './pages/ReviewPage/ReviewPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/portfolio/:handle" element={<Portfolio />} />
        <Route path="/review/:uid/:token" element={<ReviewPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)