import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaStar, FaTrophy, FaPlay, FaChevronRight } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import './styles.css';
import backgroundSVG from '../assets/bg-shape.svg';
import codingVideo from '../assets/coding.mp4'; // ✅ Correct video import

const subjects = [
  { label: 'JavaScript', value: 'code', icon: '💻', color: '#4361ee' },
  { label: 'React.js', value: 'react', icon: '⚛️', color: '#61dafb' },
  { label: 'SQL', value: 'sql', icon: '🗃️', color: '#fca311' },
  { label: 'Linux', value: 'linux', icon: '🐧', color: '#3a0ca3' },
  { label: 'DevOps', value: 'devops', icon: '🔧', color: '#f72585' },
  { label: 'HTML', value: 'html', icon: '🌐', color: '#e34c26' },
  { label: 'CSS', value: 'css', icon: '🎨', color: '#2965f1' },
  { label: 'Networking', value: 'networking', icon: '🌐', color: '#ff9f1c' },
];

const Home = () => {
  const [username, setUsername] = useState('');
  const [inputName, setInputName] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [isHovering, setIsHovering] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const storedName = sessionStorage.getItem('username');
    const storedResult = sessionStorage.getItem('lastResult');
    if (storedName) setUsername(storedName);
    if (storedResult) setLastResult(JSON.parse(storedResult));
  }, []);

  useEffect(() => {
    if (location.state?.lastResult) {
      setLastResult(location.state.lastResult);
      sessionStorage.setItem('lastResult', JSON.stringify(location.state.lastResult));
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleStart = () => {
    const trimmed = inputName.trim();
    if (trimmed.length >= 2) {
      setUsername(trimmed);
      sessionStorage.setItem('username', trimmed);
    }
  };

  if (!username) {
    return (
      <div className="welcome-screen">
        {/* SVG Background */}
        <div className="background-media">
          <img src={backgroundSVG} alt="Background SVG" className="bg-svg" />
          <div className="bg-overlay"></div>
        </div>

        <div className="welcome-container">
          <div className="welcome-card">
            <div className="app-logo">
              <span className="logo-icon">?</span>
              <span className="logo-text">QuizMaster</span>
            </div>
            <h2 className="welcome-title">Test Your Coding Knowledge</h2>
            <p className="welcome-subtitle">Enter your name to begin</p>

            <div className="input-group">
              <input
                type="text"
                placeholder="Your name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="name-input"
                maxLength="20"
              />
              <div className="input-border"></div>
            </div>

            <button
              onClick={handleStart}
              disabled={inputName.trim().length < 2}
              className={`start-btn ${inputName.trim().length >= 2 ? 'pulse' : ''}`}
            >
              <FaPlay className="btn-icon" /> Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-app-container">
      {/* 🎥 Background Video */}
      <div className="background-media">
        <video autoPlay loop muted playsInline className="bg-video">
          <source src={codingVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="bg-overlay"></div>
      </div>

      <div className="app-content">
        <header className="app-header">
          <div className="user-greeting">
            <div className="greeting-text">Hello, {username}</div>
            <div className="welcome-emoji">👋</div>
          </div>
          <div className="profile-icon">
            <FaUser />
          </div>
        </header>

        {lastResult && (
          <div
            className="result-card"
            onMouseEnter={() => !isMobile && setIsHovering('result')}
            onMouseLeave={() => !isMobile && setIsHovering(null)}
            style={{
              transform: isHovering === 'result' ? 'translateY(-5px)' : 'translateY(0)'
            }}
          >
            <div className="trophy-icon">
              <FaTrophy />
            </div>
            <h3 className="result-title">Your Last Score</h3>
            <div className="result-stats">
              <div className="stat-item">
                <span className="stat-value">{lastResult.correct}/{lastResult.total}</span>
                <span className="stat-label">Correct</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {Math.round((lastResult.correct / lastResult.total) * 100)}%
                </span>
                <span className="stat-label">Success</span>
              </div>
              <div className="stat-item">
                <span className="stat-value stars">
                  {Array(3).fill(0).map((_, i) => (
                    <FaStar key={i} className={i < lastResult.stars ? 'filled' : ''} />
                  ))}
                </span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
        )}

        <h2 className="subject-title">Choose a Quiz Category</h2>

        <div className="subject-grid">
          {subjects.map(({ label, value, icon, color }) => (
            <div
              key={value}
              className="subject-card"
              onClick={() => navigate(`/quiz/${value}`)}
              onMouseEnter={() => !isMobile && setIsHovering(value)}
              onMouseLeave={() => !isMobile && setIsHovering(null)}
              style={{
                transform: isHovering === value ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isHovering === value ?
                  `0 10px 25px ${color}40` :
                  '0 5px 15px rgba(0, 0, 0, 0.1)',
                borderTop: `4px solid ${color}`
              }}
            >
              <div className="subject-icon" style={{ color }}>{icon}</div>
              <div className="subject-name">{label}</div>
              <div className="subject-arrow">
                <IoIosArrowForward style={{ color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
