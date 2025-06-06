import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Componts/Home';
import Quiz from './Componts/Quiz';

const App = () => {

  const [username, setUsername]= useState('');
  return (
    <Router>
      <Routes>
        <Route path="/"
        element={<Home username={username} setUsername={setUsername}/>}
        />
        <Route
        path="/quiz/:subject"
        element={<Quiz/>}
        />
      </Routes>
    </Router>
  )
}

export default App
